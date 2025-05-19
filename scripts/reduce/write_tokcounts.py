import sys
import argparse
import traceback
import logging
import json
import yaml
import statistics
from collections import Counter


#$yaml_file_path $tsv_file_path $srclang $trglang
def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('srctokencountfile', type=argparse.FileType('r'), help="Input src token counts file")
    parser.add_argument('trgtokencountfile', type=argparse.FileType('r'), help="Input trg token counts file")    
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.") 
    
    args = parser.parse_args()
    return args
    
def main():    
    args = initialization()
    stats = {}
    src_sent_tokens = Counter()
    trg_sent_tokens = Counter()
    
    src_tokens_list = []
    trg_tokens_list = []
    src_unique_tokens_list = []
    trg_unique_tokens_list = []
    
    srcfile = args.srctokencountfile
    trgfile = args.trgtokencountfile
    
    
    for line in srcfile:
        parts = line.split()
        src_sent_tokens[int(parts[0])] = int(parts[1])
        src_tokens_list.append([int(parts[0]), int(parts[1])])
        src_unique_tokens_list.append([int(parts[0]), int(parts[2])])
        
    for line in trgfile:
        parts = line.split()
        trg_sent_tokens[int(parts[0])] = int(parts[1])
        trg_tokens_list.append([int(parts[0]), int(parts[1])])
        trg_unique_tokens_list.append([int(parts[0]), int(parts[2])])


    #stats["src_sent_tokens"] = str(src_tokens_list) #This is currently done in the volumes map&reduce
    stats["src_unique_sents"] = str(src_unique_tokens_list) 
    stats["src_sent_tokens"] = str(src_tokens_list)
    src_tokens_elements = sorted(src_sent_tokens.elements())
    stats["src_sent_tokens_mean"] = round(statistics.mean(src_tokens_elements))
    stats["src_sent_tokens_median"] = round(statistics.median(src_tokens_elements))

    
    stats["trg_unique_sents"] = str(trg_unique_tokens_list) 
    stats["trg_sent_tokens"] =   str(trg_tokens_list)
    trg_tokens_elements = sorted(trg_sent_tokens.elements())
    stats["trg_sent_tokens_mean"] = round(statistics.mean(trg_tokens_elements))
    stats["trg_sent_tokens_median"] = round(statistics.median(trg_tokens_elements))




    
    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)