import os
import sys
import time
import argparse
import traceback
import logging
import yaml

sys.path.append('/work/scripts/')


from util import get_fastspell_langs
from tokenizer  import CustomTokenizer
from ngrams import get_line_ngrams, get_stopwords


#$yaml_file_path $tsv_file_path $srclang $trglang
def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.") 
    parser.add_argument('corpusname', type=str, help="Corpus name")
    parser.add_argument('srclang', type=str, help="Source language")
    parser.add_argument('trglang', nargs='?',  type=str, default=None,  help="Target language")
    parser.add_argument('bicleanerconfig',  nargs='?', type=str, default=None , help="BicleanerAI config yaml file (optional)")    
    args = parser.parse_args()
    return args
    
def main():    
    args = initialization()
    stats = {}
    stats["timestamp"] = time.time()
    stats["corpus"] = args.corpusname
    stats["srclang"] = args.srclang
    if args.trglang != None:
        stats["trglang"] = args.trglang
        
    #WARNINGS    
    warnings = []
    
    #stopwords
    src_ngrams_warnings = set()    
    src_stopwords, nwarnings = get_stopwords(args.srclang)
    for w in nwarnings:
        src_ngrams_warnings.add("src_"+w)
    warnings.extend(src_ngrams_warnings)    
    
    if args.trglang != None:
        trg_ngrams_warnings = set()  
        trg_stopwords, nwarnings = get_stopwords(args.trglang)
        for w in nwarnings:
            trg_ngrams_warnings.add("trg_"+w)
        warnings.extend(trg_ngrams_warnings)    



    #tokenizer
    src_tokenizer = CustomTokenizer(args.srclang)  
    for w in src_tokenizer.getWarnings():
        warnings.append("src_"+w)

    if args.trglang != None:    
        trg_tokenizer = CustomTokenizer(args.trglang)        
        for w in trg_tokenizer.getWarnings():
            warnings.append("trg_"+w)

    #fastspell
    if (args.srclang not in get_fastspell_langs()):
        warnings.append("src_fastspell") 
    if args.trglang != None:
        if (args.trglang not in get_fastspell_langs()):
            warnings.append("trg_fastspell")

    #bicleaner xx
    if args.bicleanerconfig and os.path.exists(args.bicleanerconfig):
        with open(args.bicleanerconfig, "r+") as bicleaneryaml:
            yaml_data = yaml.safe_load(bicleaneryaml)
            if ("source_lang" in yaml_data  and yaml_data["source_lang"] == "xx")  or  ("target_lang" in yaml_data and yaml_data["target_lang"] == "xx"):
                warnings.append("bicleaner_xx")

    stats["warnings"] = warnings    
    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)