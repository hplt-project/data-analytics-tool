import os
import sys
import io
import logging
import traceback
import argparse
import json
import pandas

def initialization():
    parser = argparse.ArgumentParser(prog=os.path.basename(sys.argv[0]), formatter_class=argparse.ArgumentDefaultsHelpFormatter, description=__doc__)
    parser.add_argument('input', nargs='?', type=argparse.FileType('rb'), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input parquet file.")
    parser.add_argument('output', nargs='?', type=argparse.FileType('wt'), default=sys.stdout, help="Output.") 
    
    
    args = parser.parse_args() 
    #logging_setup(args)
    return args
    
    
def main():
    args = initialization() # Parsing parameters    
    
    df = pandas.read_parquet(args.input)
    jsonlines = df.to_json(args.output, orient="records", lines=True)
    #for l in jsonlines:
    #    args.output.write(l)
    
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)    