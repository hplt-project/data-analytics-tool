import sys
import os
import io
import argparse
import logging
import json
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer, AutoConfig
from huggingface_hub import PyTorchModelHubMixin
from util import logging_setup


def initialization():
    parser = argparse.ArgumentParser(
        prog=os.path.basename(sys.argv[0]),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
        description=__doc__,
    )
    parser.add_argument(
        "input",
        nargs="?",
        type=argparse.FileType('rt', errors="replace"),
        default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),
        help="Input sentences.",
    )
    parser.add_argument(
        "output",
        nargs="?",
        type=argparse.FileType('wt'),
        default=sys.stdout,
        help="Output of the domain identification.",
    )

    groupO = parser.add_argument_group("Options")
    groupO.add_argument(
        "--field",
        type=str,
        default="text",
        help="Name of the JSON field that contains the text to be analyzed",
    )
    groupO.add_argument("--raw", action="store_true", help="True if the input is already raw, non-json text")
    groupO.add_argument("--batchsize", type=int, default=256, help="GPU batch size")
    # Number of labels to emit per document (1 keeps previous behavior)
    groupO.add_argument("--topk", type=int, default=3, help="Number of top labels to output per document")
    # Minimum softmax confidence to accept a label; otherwise emit UNK
    groupO.add_argument("--minconf", type=float, default=0.5, help="Minimum confidence threshold (softmax)")
    # Optional model revision pin for reproducibility
    groupO.add_argument("--revision", type=str, default=None, help="HF model revision to pin")

    groupL = parser.add_argument_group("Logging")
    groupL.add_argument('-q', '--quiet', action='store_true', help='Silent logging mode')
    groupL.add_argument('--debug', action='store_true', help='Debug logging mode')
    groupL.add_argument('--info', action='store_true', help='Info logging mode')
    groupL.add_argument('--logfile', type=argparse.FileType('a'), default=sys.stderr, help="Store log to a file")

    args = parser.parse_args()
    # Respect CLI over env: only let env override if the corresponding CLI flag was not provided
    # DOMAIN_TOPK / DOMAIN_MINCONF / DOMAIN_REVISION
    if "--topk" not in sys.argv:
        env_topk = os.getenv("DOMAIN_TOPK")
        if env_topk is not None:
            try:
                args.topk = int(env_topk)
            except ValueError:
                pass
    if "--minconf" not in sys.argv:
        env_minconf = os.getenv("DOMAIN_MINCONF")
        if env_minconf is not None:
            try:
                args.minconf = float(env_minconf)
            except ValueError:
                pass
    if "--revision" not in sys.argv:
        env_revision = os.getenv("DOMAIN_REVISION")
        if env_revision:
            args.revision = env_revision

    logging_setup(args)
    return args


class NvDomainModel(nn.Module, PyTorchModelHubMixin):
    """Lightweight head on top of a base encoder as in NVIDIA's model card."""
    def __init__(self, config):
        super().__init__()
        # Support both dict-like and HF Config objects
        base_model_name = getattr(config, "base_model", None) or (config.get("base_model") if isinstance(config, dict) else None)
        if base_model_name is None:
            raise ValueError("Missing 'base_model' in config for NvDomainModel")
        self.model = AutoModel.from_pretrained(base_model_name)
        hidden_size = self.model.config.hidden_size
        fc_dropout = getattr(config, "fc_dropout", None) or (config.get("fc_dropout") if isinstance(config, dict) else 0.1)
        id2label = getattr(config, "id2label", None) or (config.get("id2label") if isinstance(config, dict) else None)
        num_labels = len(id2label) if id2label is not None else 26
        self.dropout = nn.Dropout(fc_dropout)
        self.fc = nn.Linear(hidden_size, num_labels)

    def forward(self, input_ids, attention_mask):
        features = self.model(input_ids=input_ids, attention_mask=attention_mask).last_hidden_state
        dropped = self.dropout(features)
        logits = self.fc(dropped)
        # Return probabilities over classes using [CLS] token position (index 0)
        return torch.softmax(logits[:, 0, :], dim=1)


class DomainLabels:
    def __init__(self, args):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_id = "nvidia/multilingual-domain-classifier"
        # Resolve revision
        revision = args.revision
        # Load config and model (NVIDIA hub mixin)
        config = AutoConfig.from_pretrained(self.model_id, revision=revision)
        self.model = NvDomainModel.from_pretrained(self.model_id, config=config, revision=revision).to(self.device)
        self.model.eval()
        logging.info("Domain classifier model loaded")
        # Tokenizer pinned to same revision
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_id, revision=revision)
        logging.info("Tokenizer loaded")
        # Inference config
        self.topk = max(1, int(args.topk))
        self.minconf = float(args.minconf)
        # Cache id2label once
        cfg = getattr(self.model, "config", None)
        if cfg is not None and hasattr(cfg, "id2label"):
            self.id2label = cfg.id2label
        else:
            self.id2label = AutoConfig.from_pretrained(self.model_id).id2label

    def get_labels_batch(self, docs_text):
        # Filter out empty or None texts to avoid tokenizer/model errors
        filtered_texts = [t for t in docs_text if t]
        if not filtered_texts:
            return []

        # Tokenize inputs
        inputs = self.tokenizer(
            filtered_texts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512,
        ).to(self.device)

        # Forward with safe autocast on CUDA only
        try:
            with torch.inference_mode():
                if self.device.type == "cuda":
                    with torch.autocast(device_type="cuda", dtype=torch.float16):
                        probs = self.model(inputs["input_ids"], inputs["attention_mask"])  # already softmax
                else:
                    # On CPU, avoid float16 autocast; optionally could use bfloat16 if available
                    probs = self.model(inputs["input_ids"], inputs["attention_mask"])  # already softmax
        except (RuntimeError, MemoryError) as e:
            # Simple OOM mitigation: split the batch and process recursively
            msg = str(e).lower()
            if ("out of memory" in msg or "cuda error: out of memory" in msg or "oom" in msg) and len(filtered_texts) > 1:
                mid = len(filtered_texts) // 2
                return self.get_labels_batch(filtered_texts[:mid]) + self.get_labels_batch(filtered_texts[mid:])
            raise

        # probs already in probability space
        probs = probs.cpu()
        # id2label mapping cached at init
        id2label = self.id2label

        results = []
        max_conf_values = []
        unk_count = 0
        for row in probs:
            # Select top-k indices by confidence
            values, indices = torch.topk(row, k=min(self.topk, row.shape[0]))
            selected = []
            for conf, idx in zip(values.tolist(), indices.tolist()):
                if conf >= self.minconf:
                    selected.append(id2label[idx])
            # Fallback if nothing surpasses threshold
            if not selected:
                selected = ["UNK"]
                unk_count += 1
            results.extend(selected)
            # Track max confidence for logging
            max_conf_values.append(float(torch.max(row)))
        # Log basic confidence stats in info/debug modes
        if logging.getLogger().level <= logging.INFO and max_conf_values:
            try:
                avg_conf = sum(max_conf_values) / len(max_conf_values)
                logging.info(f"Domain avg max-conf (batch): {avg_conf:.3f}; UNK-rate: {unk_count}/{len(probs)}")
            except Exception:
                pass
        return results


def perform_identification(args):
    dl = DomainLabels(args)
    buffer = []
    for line in args.input:
        if not args.raw:
            doc = json.loads(line)
            doc_text = doc.get(args.field)
        else:
            doc_text = line
        if doc_text:
            buffer.append(doc_text)
        if len(buffer) < args.batchsize:
            continue
        labels = dl.get_labels_batch(buffer)
        buffer = []
        for l in labels:
            args.output.write(l.strip() + "\n")
    if buffer:
        labels = dl.get_labels_batch(buffer)
        for l in labels:
            args.output.write(l.strip() + "\n")


def main():
    args = initialization()
    perform_identification(args)


if __name__ == "__main__":
    main()
