import sys
import time
import argparse
import traceback
import logging
#from util import  write_stats
import yaml

#$yaml_file_path $tsv_file_path $srclang $trglang
def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.") 
    parser.add_argument('corpusname', type=str, help="Corpus name")
    parser.add_argument('srclang', type=str, help="Source language")
    parser.add_argument('trglang', type=str, help="Target language")
    
    args = parser.parse_args()
    return args
    
def main():    
    args = initialization()
    stats = {}
    stats["timestamp"] = time.time()
    stats["corpus"] = args.corpusname
    stats["srclang"] = args.srclang
    stats["trglang"] = args.trglang
    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)