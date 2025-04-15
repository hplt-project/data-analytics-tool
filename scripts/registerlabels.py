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
from util import logging_setup

def initialization():
    parser = argparse.ArgumentParser(prog=os.path.basename(sys.argv[0]), formatter_class=argparse.ArgumentDefaultsHelpFormatter, description=__doc__)
    parser.add_argument('input',  nargs='?', type=argparse.FileType('rt', errors="replace"), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input sentences.")
    parser.add_argument('output', nargs='?', type=argparse.FileType('wt'), default=sys.stdout, help="Output of the register identification.")
    
    groupO = parser.add_argument_group("Options")
    groupO.add_argument("--field", type=str, default="text", help="Name of the JSON field that contains the text to be analyzed")
    groupO.add_argument("--raw", action="store_true", help="True if the input is already raw, non-json text")
    
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
        


def is_main_class(label):
    return (label in  ["LY",  "SP", "ID", "NA", "HI", "IP", "IN", "OP"])     
    
def get_main_class(label):
    #if label in ["MT"]: return "MT"
    if label in ["LY"]: return "LY"
    if label in ["it", "SP"]: return "SP"
    if label in ["ID"]: return "ID"
    if label in ["ne", "sr", "nb", "NA"]: return "NA"
    if label in ["re", "HI"]: return "HI"
    if label in ["ds", "ed", "IP"]: return "IP"
    if label in ["en", "ra", "dtp", "fi", "lt", "IN"]: return "IN"
    if label in ["rv", "ob", "rs", "av", "OP"]: return "OP"
    raise ValueError("Unknown label: " + label)


def get_class(label):
    if is_main_class(label):
        return label + "_other"
    else:
        return get_main_class(label) + "_" + label


def refine_labels(filtered_labels):
        #MT label is treated independently
        refined_labels = []
        if "MT" in filtered_labels:
            #classes["MT"] += 1
            filtered_labels.remove("MT")
            logging.debug("MT")
            refined_labels.append("MT")


        #No matching registers --> UNK
        if len(filtered_labels) == 0:
            #classes["UNK"] += 1
            logging.debug("UNK")
            refined_labels.append("UNK")
            return refined_labels

        #Many matching registers --> MIX
        main_labels = set([get_main_class(label) for label in filtered_labels])
        if len(main_labels) > 1:
            #classes["MIX"] += 1
            logging.debug("MIX")
            refined_labels.append("MIX")
            return refined_labels

        #Only one main register at this point
        raw_classes = [get_class(label) for label in filtered_labels] 

        #only one label -->  return the label
        if len(raw_classes) == 1:
            logging.debug(raw_classes[0])
            #classes[raw_classes[0]] += 1
            refined_labels.append(raw_classes[0])
            return refined_labels

        subclasses = [cls.split("_")[1] for cls in raw_classes]
        subclasses_main = []
        if "other" in subclasses:
            subclasses_main = ["other"]
            subclasses.remove("other")

        #two labels, one is a parent of the other --> return child     
        if len(subclasses_main) == 1 and len(subclasses) == 1:
            final_label = get_main_class(subclasses[0]) + "_" + subclasses[0]
            logging.debug(final_label)
            #classes[final_label] += 1
            refined_labels.append(final_label)
            return refined_labels

        #more than two labels in total (by definition, at least two of them are siblings)--> return the main label (regardless it is or it is not in the list) 
        if len(subclasses) > 1:
            #take the first one for example
            final_label = get_main_class(subclasses[0]) + "_other"
            logging.debug(final_label)
            #classes[final_label]+= 1
            refined_labels.append(final_label)
            return refined_labels

        logging.error(" =============== YOU SHOULD NOT BE READING THIS ====================")




def perform_identification(args):
    time_start = timeit.default_timer()
    rl = RegisterLabels()    
    docs = 0    
    for line in args.input:
        docs = docs+1
        if not args.raw:
            doc = json.loads(line)
            doc_text = doc.get(args.field)
        else:
            doc_text = line
        labels = rl.get_labels(doc_text)
        for l in labels: #one label, or two if MT is one of them
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