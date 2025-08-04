import sys
import argparse
import traceback
import logging
import json
import yaml

def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('rlcounts', type=argparse.FileType('r'), help="Input register labels counts file")    
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.") 
       
    args = parser.parse_args()
    return args
    
def main():    
    args = initialization()
    stats = {}
    
    rl_dict = {}
    
    for line in args.rlcounts:
        lineparts = line.split()
        rl_id = lineparts[1].strip()
        rl_count = int(lineparts[0].strip())
        rl_dict[rl_id]=rl_count

    if len(rl_dict) > 0:
        stats["register_labels"] = json.dumps(rl_dict)

    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)