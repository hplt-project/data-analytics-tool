import os
import sys
import argparse
import traceback
import logging
import json
import yaml


def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('scoresfile', type=argparse.FileType('r'), help="Input bicleaner scores file")
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.") 
    parser.add_argument('modelyamlfile', nargs='?', type=str, default=None, help="Path to bicleaner model yaml file")
    args = parser.parse_args()
    return args

def read_scores(scoresfile):

    buckets = [0 for _ in range(10)]        

    for line in scoresfile:
        score = line.strip()
        try:
            bucket_index = int(float(score) * 10)
            buckets[bucket_index]+=1
        except IndexError as ex:
            if bucket_index == 10:
                buckets[9]+=1 #score was 1.000, add to last bucket
            else:
                logging.error(ex)                

    bucket_counts = [[i / 10, bucket] for i, bucket in enumerate(buckets)]

    return(bucket_counts)
    
        

def main():    
    args = initialization()
    stats = {}

    bicleaner_scores = read_scores(args.scoresfile)
    
    stats["bicleaner_scores"] = json.dumps(bicleaner_scores)
        
    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)