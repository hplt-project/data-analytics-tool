import os
import sys
import logging
import traceback
import argparse
import yaml
import json
import math

from timeit import default_timer
from util import logging_setup
from collections import Counter
from fastspell import FastSpell
from ngrams import get_ngrams
from monocleanerscorer import read_monocleanerscores

def initialization():
    parser = argparse.ArgumentParser()
    
    parser.add_argument('corpus', type=argparse.FileType('rt'), help="Corpus name. Prefix to the source and target bitexts.")
    parser.add_argument('statsfile', type=argparse.FileType('w'), help="Output YAML stats file.") #TODO: default tmpfile
    parser.add_argument('srclang', type=str, help="Source language")

    # Logging group
    groupL = parser.add_argument_group('Logging')
    groupL.add_argument('-q', '--quiet', action='store_true', help='Silent logging mode')
    groupL.add_argument('--debug', action='store_true', help='Debug logging mode')
    groupL.add_argument('--logfile', type=argparse.FileType('a'), default=sys.stderr, help="Store log to a file")
    #groupL.add_argument('-v', '--version', action='version', version="%(prog)s " + __version__, help="show version of this script and exit")


    args = parser.parse_args()
    return args

#Probably more fanciness needed here
def write_stats(statsfile, statsdict):
    yaml.dump(statsdict, statsfile)    

#Currently a dummy
def count_tokens(sent):
    return(len(sent.split(" ")))

# To convert sizes
def convert_size(size_bytes):
   if size_bytes == 0:
       return "0B"
   size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
   i = int(math.floor(math.log(size_bytes, 1024)))
   p = math.pow(1024, i)
   s = round(size_bytes / p, 2)
   return "%s %s" % (s, size_name[i])

def main():
    args = initialization() # Parsing parameters
    logging_setup(args)
    logging.info("Starting process")
    time_start = default_timer()

    total_lines=0
    src_sent_tokens = Counter() #defaultdict(int) #Amount of tokens in the source sentence

    src_tokens = []

    src_bytes=0

    src_langs = Counter()
    
    #Pure metadata could be in a different function
    stats = {}
    stats["corpus"] = os.path.basename(args.corpus.name)
    stats["srclang"] = args.srclang
    filename = os.path.basename(args.corpus.name)
    
    fastspell_src = FastSpell(args.srclang, mode="cons")
    
    src_file=open(args.corpus.name,"r").read().splitlines()

    for src_line in src_file:
        total_lines = total_lines+1
        
        #Counting tokens in each sentence
        src_tokens_count = count_tokens(src_line)
        src_sent_tokens[src_tokens_count] += 1

        #Get langid for each sentence
        src_langid = fastspell_src.getlang(src_line)
        src_langs[src_langid] += 1
        
        #Add tokens for each sentence
        src_tokens.extend(src_line.split()) # Tokenization can be improved
        
        # Corpus strings
        src_bytes += len(src_line.encode('utf-8'))

    stats["sentence_pairs"] = total_lines
    
    src_tokens_list = []
    for token, freq in sorted(src_sent_tokens.items()):
        src_tokens_list.append([token, freq])
    stats["src_sent_tokens"] = str(src_tokens_list)

    src_langs_list = []
    for lang, freq in src_langs.most_common():
        src_langs_list.append([lang, freq])
    stats["src_langs"] = json.dumps(src_langs_list)

    # ngrams
    src_ngrams = get_ngrams(src_tokens, 2)
    stats["src_ngrams"] = json.dumps(src_ngrams)

    # type token ratio
    ttr_src = round(len(set(src_tokens))/ len(src_tokens),2)
    stats["ttr_src"] = json.dumps(ttr_src)

    # bytes size
    stats["src_bytes"] = json.dumps(convert_size(src_bytes))

    # monocleaner scores
    monocleaner_scores = read_monocleanerscores(filename)
    stats["monocleaner_scores"] = json.dumps(monocleaner_scores)

    write_stats(args.statsfile, stats)
    logging.info("Finished")
    elapsed_time = default_timer() - time_start
    logging.info("Total: {0} rows".format(total_lines))
    logging.info("Elapsed time {0:.2f} s".format(elapsed_time))
    logging.info("Troughput: {0} rows/s".format(int((total_lines*1.0)/elapsed_time)))
        
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)
