import sys
import os
import io
import argparse
import logging
import timeit
import json
import torch
from datasets import load_dataset
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from util import logging_setup, refine_labels

def initialization():
    parser = argparse.ArgumentParser(prog=os.path.basename(sys.argv[0]), formatter_class=argparse.ArgumentDefaultsHelpFormatter, description=__doc__)
    parser.add_argument('input',  nargs='?', type=argparse.FileType('rt', errors="replace"), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input sentences.")
    parser.add_argument('output', nargs='?', type=argparse.FileType('wt'), default=sys.stdout, help="Output of the register identification.")
    
    groupO = parser.add_argument_group("Options")
    groupO.add_argument("--field", type=str, default="text", help="Name of the JSON field that contains the text to be analyzed")
    groupO.add_argument("--raw", action="store_true", help="True if the input is already raw, non-json text")
    groupO.add_argument("--batchsize", type=int, default=256, help="GPU batch size")
        
    groupL = parser.add_argument_group('Logging')
    groupL.add_argument('-q', '--quiet', action='store_true', help='Silent logging mode')
    groupL.add_argument('--debug', action='store_true', help='Debug logging mode')
    groupL.add_argument('--info', action='store_true', help='Info logging mode')
    groupL.add_argument('--logfile', type=argparse.FileType('a'), default=sys.stderr, help="Store log to a file")
    #groupL.add_argument('-v', '--version', action='version', version="%(prog)s " + __version__, help="show version of this script and exit")

    args = parser.parse_args()
    logging_setup(args)
    return args

#logging.basicConfig(level=logging.DEBUG)    
    
class RegisterLabels:
    
    def __init__(self):
        #supported languages; https://github.com/facebookresearch/fairseq/tree/main/examples/xlmr
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_id = "TurkuNLP/multilingual-web-register-classification"

        # Load model and tokenizer
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_id).to(self.device)
        logging.info ("Model loaded")
        self.tokenizer = AutoTokenizer.from_pretrained("xlm-roberta-large")
        logging.info("Tokenizer loaded")

        self.threshold = 0.5
    
    def get_labels(self, text):
        # Tokenize text
        inputs = self.tokenizer([text], return_tensors="pt", padding=True, truncation=True, max_length=512).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            
        # Apply sigmoid to the logits to get probabilities
        probabilities = torch.sigmoid(outputs.logits).squeeze()            
        predicted_label_indices = (probabilities>self.threshold).nonzero(as_tuple=True)[0]
        
        # Extract readable labels using id2label
        id2label = self.model.config.id2label
        predicted_labels = [id2label[idx.item()] for idx in predicted_label_indices]
    
        refined_labels = refine_labels(predicted_labels)
        
        return refined_labels
    
    def get_labels_batch(self, docs_text):    
        # Tokenize text
        inputs = self.tokenizer(
                docs_text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512).to(self.device)

        with torch.no_grad(), torch.autocast(device_type=self.device.type, dtype=torch.float16):
            outputs = self.model(**inputs)
        
        # Apply sigmoid to the logits to get probabilities        
        probabilities = torch.sigmoid(outputs.logits).squeeze()
        
        refined_labels = []        
        for prob in probabilities:          
            predicted_label_indices = (prob>self.threshold).nonzero(as_tuple=True)[0]  
            predicted_labels = [self.model.config.id2label[idx.item()] for idx in predicted_label_indices]
            refined_labels.append(refine_labels(predicted_labels))
        #assert len(docs_text) == len(refined_labels)            
        return refined_labels


def perform_identification(args):
    time_start = timeit.default_timer()
    rl = RegisterLabels()    
    docs = 0    
    buffer=[]
    for line in args.input:
        docs = docs+1
        if not args.raw:
            doc = json.loads(line)
            doc_text = doc.get(args.field)
        else:
            doc_text = line
        buffer.append(doc_text)            
        if len(buffer) < args.batchsize:

            continue
        else:
            batch_labels = rl.get_labels_batch(buffer)
            buffer=[]
            for doc_labels in batch_labels:
                for l in doc_labels:
                    args.output.write(l.strip()+"\n")

    #remaining docs in batch
    if len(buffer) > 0:
        batch_labels = rl.get_labels_batch(buffer)
        for doc_labels in batch_labels: #one label, or two if MT is one of them
            for l in doc_labels:
                args.output.write(l.strip()+"\n")

    elapsed_time = timeit.default_timer() - time_start
    logging.info("Total: {0} docs".format(docs))
    logging.info("Elapsed time {0:.2f} s".format(elapsed_time))
    logging.info("Troughput: {0} docs/s".format(int((docs*1.0)/elapsed_time)))    

def main():
    logging_setup()
    args = initialization() # Parsing parameters
    logging.info("Executing main program...")
    perform_identification(args)
    logging.info("Program finished")

if __name__ == '__main__':
    main()
