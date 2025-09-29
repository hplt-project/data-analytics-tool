import sys
import argparse
import traceback
import logging
import json
import yaml
import statistics
from collections import Counter


def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.")     
    parser.add_argument('srctokencountfile', type=argparse.FileType('r'), help="Input src token counts file")
    parser.add_argument('trgtokencountfile', nargs='?', type=str, default=None,  help="Input trg token counts file (optional)")    

    
    args = parser.parse_args()
    return args

def calculate_median(freq_dist):
    # First, get total number of sentences
    total_count = sum(count for _, count in freq_dist)
    
    if total_count == 0:
        return 0
    
    # Sort by length (should already be sorted based on your example)
    sorted_dist = sorted(freq_dist, key=lambda x: x[0])
    
    # Find median position(s)
    if total_count % 2 == 1:
        # Odd number of elements - find the single middle element
        target_pos = total_count // 2
        current_pos = 0
        
        for length, count in sorted_dist:
            current_pos += count
            if current_pos > target_pos:
                return length
    else:
        # Even number of elements - average of two middle elements
        target_pos1 = total_count // 2 - 1
        target_pos2 = target_pos1 + 1
        current_pos = 0
        median_values = []
        
        for length, count in sorted_dist:
            if current_pos <= target_pos1 < current_pos + count:
                median_values.append(length)
            if current_pos <= target_pos2 < current_pos + count:
                median_values.append(length)
                break
            current_pos += count
        
        # If both median positions are in the same bucket
        if len(median_values) == 1:
            return median_values[0]
        else:
            return (median_values[0] + median_values[1]) / 2

def calculate_mean(freq_dist):
    total_sum = 0
    total_count = 0
    for length, count in freq_dist.items():
        total_sum += length * count
        total_count += count
    
    mean = total_sum / total_count if total_count > 0 else 0
    return mean

def main():    
    args = initialization()
    stats = {}

    src_sent_tokens = Counter()
    src_tokens_list = []    
    src_unique_tokens_list = []    
    srcfile = args.srctokencountfile    
    logging.error("Start reading")
    
    for line in srcfile:
        parts = line.split()
        src_sent_tokens[int(parts[0])] = int(parts[1])
        src_tokens_list.append([int(parts[0]), int(parts[1])])
        src_unique_tokens_list.append([int(parts[0]), int(parts[2])])
    
    logging.error("Computing stats")
    stats["src_unique_sents"] = str(src_unique_tokens_list) 
    stats["src_sent_tokens"] = str(src_tokens_list)
    stats["src_sent_tokens_mean"] = round(calculate_mean(src_sent_tokens))
    stats["src_sent_tokens_median"] = round(calculate_median(src_sent_tokens.items()))

    logging.error("Computed stats")

    if args.trgtokencountfile != None:
        #is parallel
        trg_sent_tokens = Counter()
        trg_tokens_list = []
        trg_unique_tokens_list = []    
        with open(args.trgtokencountfile, 'r') as trgfile:            
            for line in trgfile:
                parts = line.split()
                trg_sent_tokens[int(parts[0])] = int(parts[1])
                trg_tokens_list.append([int(parts[0]), int(parts[1])])
                trg_unique_tokens_list.append([int(parts[0]), int(parts[2])])
   
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
