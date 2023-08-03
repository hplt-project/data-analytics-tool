import time
import os
import sys
import logging
import traceback
import argparse
import yaml
import json
import math

from sacremoses import MosesTokenizer
from timeit import default_timer
from util import logging_setup
from collections import Counter
from xxhash import xxh64
from fastspell import FastSpell
from ngrams import get_ngrams
from bicleanerscorer import read_hardrulestags, read_scores

def initialization():
    parser = argparse.ArgumentParser()
    
    parser.add_argument('corpus', type=argparse.FileType('rt'), help="Corpus name. Prefix to the source and target bitexts.")
    parser.add_argument('statsfile', type=str, help="Output YAML stats file.") #TODO: default tmpfile #type=argparse.FileType('w'),    
    parser.add_argument('srclang', type=str, help="Source language")
    parser.add_argument('trglang', type=str, help="Target language")

    parser.add_argument('-y', '--yamlfile', type=str, default="", help="Path to bicleaner model yaml file")  
    parser.add_argument('-r', '--is_reversed', action="store_true", help="True if the language pair was reversed for bicleaner")

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
    with open(statsfile, "w") as f:
        yaml.dump(statsdict, f)    

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
    trg_sent_tokens = Counter() #defaultdict(int) #Amount of tokens in the target sentence
    
    src_tokenizer = MosesTokenizer(args.srclang)
    trg_tokenizer = MosesTokenizer(args.trglang)

    src_tokens = []
    trg_tokens = []

    src_bytes=0
    trg_bytes=0

    src_langs = Counter()
    trg_langs = Counter()

    src_hashes = {}
    trg_hashes = {}
    sent_hashes = set()
    
    warnings = []
        
    #Pure metadata could be in a different function
    stats = {}
    stats["corpus"] = os.path.basename(args.corpus.name)
    stats["srclang"] = args.srclang
    stats["trglang"] = args.trglang
    
    fastspell_src = FastSpell(args.srclang, mode="cons")
    fastspell_trg = FastSpell(args.trglang, mode="cons")
    
    if "tsv" in args.corpus.name:
        filename=args.corpus.name.replace(".tsv","")
    else:
        filename=args.corpus.name
    src_file=open(filename+"."+args.srclang,"r").read().splitlines()
    trg_file=open(filename+"."+args.trglang,"r").read().splitlines()

    for src_line, trg_line in zip(src_file,trg_file):
        total_lines = total_lines+1
        
        if len(src_line.strip()) == 0:
            src_sent_tokens[0] += 1
            #continue
        if len(trg_line.strip()) == 0:
            trg_sent_tokens[0] += 1
            #continue

        sent_parts = (src_line, trg_line)
                
        try:
            src_sent = sent_parts[0].strip()
            trg_sent = sent_parts[1].strip()
        except IndexError as ex:
            logging.error("Missing parts in sentence: " +  line)
            src_sent = ""
            trg_sent = ""
            #continue
            
        #Counting tokens in each sentence
        tokenized_src = src_tokenizer.tokenize(src_sent, escape=False)
        tokenized_trg = trg_tokenizer.tokenize(trg_sent, escape=False)

        src_tokens_count = len(tokenized_src)
        trg_tokens_count = len(tokenized_trg)
        
        src_sent_tokens[src_tokens_count] += 1
        trg_sent_tokens[trg_tokens_count] += 1

        #Get hashes in each sentence 
        src_hash = xxh64(src_sent).hexdigest()
        trg_hash = xxh64(trg_sent).hexdigest()
        sent_hash = xxh64(src_sent + "\t" + trg_sent).hexdigest()
        
        try:
            src_hashes[src_tokens_count].add(src_hash)
        except KeyError:
            src_hashes[src_tokens_count] = set()
            src_hashes[src_tokens_count].add(src_hash)
            
        try:
            trg_hashes[trg_tokens_count].add(trg_hash)
        except KeyError:
            trg_hashes[trg_tokens_count] = set()
            trg_hashes[trg_tokens_count].add(trg_hash)
            
        sent_hashes.add(sent_hash)
            
        #Get langid for each sentence
        src_langid = fastspell_src.getlang(src_sent)
        trg_langid = fastspell_trg.getlang(trg_sent)
        src_langs[src_langid] += 1
        trg_langs[trg_langid] += 1        
        
        #Add tokens for each sentence
        src_tokens.extend(tokenized_src)
        trg_tokens.extend(tokenized_trg)
         
        # Corpus strings
        src_bytes += len(src_sent.encode('utf-8'))
        trg_bytes += len(trg_sent.encode('utf-8'))

    stats["sentence_pairs"] = total_lines
    stats["unique_sents"] = len(sent_hashes)
    
    #stats["src_sent_tokens"] = str(sorted(src_sent_tokens.items())) #This generates tuples
    #stats["trg_sent_tokens"] = str(sorted(trg_sent_tokens.items())) #This generates tuples
    
    #Process together token length and hashes list per token to avoid issues with different items in list
    # (shouldn't happen but who knows)
    src_tokens_list = []
    src_hashes_list = []
    for token, freq in sorted(src_sent_tokens.items()):
        src_tokens_list.append([token, freq])
        try:
            src_hashes_list.append([token, len(src_hashes[token])])
        except KeyError:
            src_hashes_list.append([token, 0])
    if len(src_tokens_list) > 0:
        stats["src_sent_tokens"] = str(src_tokens_list)
    if len(src_hashes_list) > 0:
        stats["src_unique_sents"] = str(src_hashes_list)
    
    trg_tokens_list = []
    trg_hashes_list = []
    for token, freq in sorted(trg_sent_tokens.items()):
        trg_tokens_list.append([token, freq])        
        try:
            trg_hashes_list.append([token, len(trg_hashes[token])])
        except KeyError:
            trg_hashes_list.append([token, 0])
    if len(trg_tokens_list) > 0:
        stats["trg_sent_tokens"] = str(trg_tokens_list)
    if len(trg_hashes_list) > 0:
        stats["trg_unique_sents"] = str(trg_hashes_list)


    src_langs_list = []
    for lang, freq in src_langs.most_common():
        src_langs_list.append([lang, freq])
    if len(src_langs_list) > 0:
        stats["src_langs"] = json.dumps(src_langs_list)

    trg_langs_list = []
    for lang, freq in trg_langs.most_common():
        trg_langs_list.append([lang, freq])
    if len(trg_langs_list) > 0 :
        stats["trg_langs"] = json.dumps(trg_langs_list)

    # ngrams
    '''
    with open("src_tokens.txt", "w") as f:
        f.write(str(src_tokens))
    with open("trg_tokens.txt", "w") as f:
        f.write(str(trg_tokens))
    '''    
    src_ngrams = get_ngrams(src_tokens, 5)
    trg_ngrams = get_ngrams(trg_tokens, 5)
    if len(src_ngrams) > 0:        
        stats["src_ngrams"] = json.dumps(src_ngrams)
    if len(trg_ngrams) > 0:
        stats["trg_ngrams"] = json.dumps(trg_ngrams)

    # type token ratio
    try:
        ttr_src = round(len(set(src_tokens))/ len(src_tokens),2)
    except ZeroDivisionError:
        ttr_src = None
    try:
        ttr_trg = round(len(set(trg_tokens))/ len(trg_tokens),2)
    except ZeroDivisionError:
        ttr_trg = None
    
    if ttr_src:
        stats["ttr_src"] = ttr_src
    if ttr_trg:
        stats["ttr_trg"] = ttr_trg
    
    if len(src_tokens)>0:
        stats["src_tokens"] = len(src_tokens)
    if len(trg_tokens)>0:
        stats["trg_tokens"] = len(trg_tokens)

    # bytes size
    stats["src_bytes"] = convert_size(src_bytes)
    stats["trg_bytes"] = convert_size(trg_bytes)

    # bicleaner-hardrules tags
    if args.is_reversed:
        bicleaner_tags = read_hardrulestags(filename, args.yamlfile, args.trglang, args.srclang)
    else:
        bicleaner_tags = read_hardrulestags(filename, args.yamlfile, args.srclang, args.trglang)
    if len(bicleaner_tags) > 0 :
        stats["hardrules_tags"] = json.dumps(bicleaner_tags)
    # bicleaner-classify scores
    bicleaner_scores = read_scores(filename)
    if len(bicleaner_scores) > 0:
        stats["bicleaner_scores"] = json.dumps(bicleaner_scores)
    
    if os.path.exists(args.yamlfile):
        with open(args.yamlfile, 'r') as  yamlfile:
            yaml_data = yaml.safe_load(yamlfile)
            if ("source_lang" in yaml_data  and yaml_data["source_lang"] == "xx")  or  ("target_lang" in yaml_data and yaml_data["target_lang"] == "xx"):
                warnings.append("bicleaner_xx")
    
    stats["warnings"] = warnings
    stats["timestamp"]=time.time()
    
    write_stats(args.statsfile, stats)
    
    logging.info("Finished stats for " + args.statsfile)
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
