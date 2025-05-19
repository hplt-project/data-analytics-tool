import sys
import argparse
import traceback
import logging
import json
import yaml

def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('srclangcounts', type=argparse.FileType('r'), help="Input src langcounts file")
    parser.add_argument('trglangcounts', type=argparse.FileType('r'), help="Input trg langcounts file")    
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.") 
    
    args = parser.parse_args()
    return args
    
def main():    
    args = initialization()
    stats = {}
    
    src_langs_list = []
    trg_langs_list = []
    
    for line in args.srclangcounts:
        lineparts = line.split()
        id_lang = lineparts[1].strip()
        count_lang = int(lineparts[0].strip())
        src_langs_list.append([id_lang, count_lang])

    for line in args.trglangcounts:
        lineparts = line.split()
        id_lang = lineparts[1].strip()
        count_lang = int(lineparts[0].strip())
        trg_langs_list.append([id_lang, count_lang])
    
    stats["src_langs"] = json.dumps(src_langs_list)
    stats["trg_langs"] = json.dumps(trg_langs_list)

    
    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)