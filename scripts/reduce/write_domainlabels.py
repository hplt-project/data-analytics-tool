import sys
import argparse
import traceback
import logging
import json
import yaml
import os


def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('dlcounts', type=argparse.FileType('r'), help="Input domain labels counts file")
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.")
    return parser.parse_args()


def main():
    args = initialization()
    stats = {}
    dl_dict = {}
    for line in args.dlcounts:
        line = line.rstrip("\n")
        if not line:
            continue
        try:
            count_str, label = line.lstrip().split(maxsplit=1)
            count = int(count_str)
        except ValueError:
            # Skip malformed lines
            continue
        dl_dict[label] = count
    if dl_dict:
        stats["domain_labels"] = json.dumps(dl_dict)
        # Attach minimal metadata for transparency/reproducibility
        try:
            topk_env = os.getenv("DOMAIN_TOPK")
            minconf_env = os.getenv("DOMAIN_MINCONF")
            revision_env = os.getenv("DOMAIN_REVISION")
            topk_val = int(topk_env) if topk_env is not None else 3
            minconf_val = float(minconf_env) if minconf_env is not None else 0.5
            stats["domain_labels_meta"] = json.dumps({
                "model_id": "nvidia/multilingual-domain-classifier",
                "revision": revision_env if revision_env else None,
                "topk": topk_val,
                "minconf": minconf_val,
            })
        except Exception:
            # best-effort: do not fail stats writing due to meta
            pass
    yaml.dump(stats, args.yamlfile)


if __name__ == '__main__':
    try:
        main()
    except Exception:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)
