import sys
import os
import io
import argparse
import logging
import timeit
import json
#from util import logging_setup
import registerlabels

THRESHOLD = 0.5

def initialization():
    parser = argparse.ArgumentParser(prog=os.path.basename(sys.argv[0]), formatter_class=argparse.ArgumentDefaultsHelpFormatter, description=__doc__)
    parser.add_argument('input',  nargs='?', type=argparse.FileType('rt', errors="replace"), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input sentences.")
    parser.add_argument('output', nargs='?', type=argparse.FileType('wt'), default=sys.stdout, help="Output of the register identification.")
    
    args = parser.parse_args()

    return args
    

def main():

    args = initialization() # Parsing parameters

    for line in args.input:
        raw_labels = json.loads(line)

        filtered_labels=[]

        for item in raw_labels:
            if float(raw_labels.get(item)) > THRESHOLD:
                filtered_labels.append(item)
        
        refined_labels = registerlabels.refine_labels(filtered_labels)
        for label in refined_labels:
            args.output.write(label.strip()+"\n")
if __name__ == '__main__':
    main()
