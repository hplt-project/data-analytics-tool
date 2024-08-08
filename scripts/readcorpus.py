import time
import os
import re
import sys
import logging
import traceback
import argparse
import yaml
import json
import math
import statistics
from iso639 import Lang


from pii_manager import PiiEnum
from pii_manager.api import PiiManager
from pii_manager.lang import COUNTRY_ANY

from timeit import default_timer
from util import logging_setup
from collections import Counter
from xxhash import xxh64
from ngrams import get_line_ngrams, get_stopwords
from bicleanerscorer import read_hardrulestags, read_scores
from tokenizer  import CustomTokenizer

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
    
    src_tokenizer = CustomTokenizer(args.srclang)
    trg_tokenizer = CustomTokenizer(args.trglang)

    logging.info("Tokenizing " + args.srclang + " with " +src_tokenizer.toktype + " (" + str(src_tokenizer.getWarnings()) +")") 
    logging.info("Tokenizing " + args.trglang + " with " +trg_tokenizer.toktype + " (" + str(src_tokenizer.getWarnings()) +")") 
    
    src_tokens = []
    src_alpha_tokens = []
    
    trg_tokens = []
    trg_alpha_tokens = [] 
    
    src_bytes=0
    trg_bytes=0

    src_chars = 0
    trg_chars = 0
    
    src_langs = Counter()
    trg_langs = Counter()

    src_hashes = {}
    trg_hashes = {}
    sent_hashes = set()
        
    src_pii=0
    trg_pii=0
    
    #PII
    src_pii_isolang = Lang(args.srclang.split('_')[0])
    trg_pii_isolang = Lang(args.trglang.split('_')[0])
    
    if src_pii_isolang.pt3 == 'hbs':
        src_pii_lang = 'hbs'
    elif not src_pii_isolang.pt1:
        src_pii_lang = 'any'
    else:
        src_pii_lang = src_pii_isolang.pt1

    if trg_pii_isolang.pt3 == 'hbs':
        trg_pii_lang = 'hbs'
    elif not trg_pii_isolang.pt1:
        trg_pii_lang = 'any'
    else:
        trg_pii_lang = trg_pii_isolang.pt1

    pii_country = COUNTRY_ANY
    pii_tasklist = (PiiEnum.IP_ADDRESS, PiiEnum.EMAIL_ADDRESS, PiiEnum.PHONE_NUMBER)
    src_pii_proc = PiiManager(src_pii_lang, pii_country, tasks=pii_tasklist, mode="extract")    
    trg_pii_proc = PiiManager(trg_pii_lang, pii_country, tasks=pii_tasklist, mode="extract")   
    
    warnings = []
    

    for w in src_tokenizer.getWarnings():
        warnings.append("src_"+w)
    for w in trg_tokenizer.getWarnings():
        warnings.append("trg_"+w)
        
        
    #ngrams files
    src_onegrams_file = open(args.corpus.name + "." + args.srclang + ".one", "w")
    src_twograms_file = open(args.corpus.name +  "." + args.srclang + ".two", "w")
    src_threegrams_file = open(args.corpus.name + "." + args.srclang +  ".three", "w")
    src_fourgrams_file = open(args.corpus.name + "." + args.srclang + ".four", "w")
    src_fivegrams_file = open(args.corpus.name + "." + args.srclang +".five", "w")        

    trg_onegrams_file = open(args.corpus.name + "." + args.trglang + ".one", "w")
    trg_twograms_file = open(args.corpus.name +  "." + args.trglang + ".two", "w")
    trg_threegrams_file = open(args.corpus.name + "." + args.trglang +  ".three", "w")
    trg_fourgrams_file = open(args.corpus.name + "." + args.trglang + ".four", "w")
    trg_fivegrams_file = open(args.corpus.name + "." + args.trglang +".five", "w")

    src_onegrams_buffer = []
    src_twograms_buffer = []
    src_threegrams_buffer = []
    src_fourgrams_buffer =  []
    src_fivegrams_buffer = []
    
    trg_onegrams_buffer = []
    trg_twograms_buffer = []
    trg_threegrams_buffer = []
    trg_fourgrams_buffer =  []
    trg_fivegrams_buffer = []

    src_onegrams_counter = 0
    src_twograms_counter = 0
    src_threegrams_counter = 0
    src_fourgrams_counter = 0
    src_fivegrams_counter = 0
    
    trg_onegrams_counter = 0
    trg_twograms_counter = 0
    trg_threegrams_counter = 0
    trg_fourgrams_counter = 0
    trg_fivegrams_counter = 0
       
    src_ngrams_warnings = set()    
    trg_ngrams_warnings = set()
    
    src_stopwords, nwarnings = get_stopwords(args.srclang)
    for w in nwarnings:
        src_ngrams_warnings.add("src_"+w)
    trg_stopwords, nwarnings = get_stopwords(args.trglang)
    for w in nwarnings:
        trg_ngrams_warnings.add("trg_"+w)
    
          
    #Pure metadata could be in a different function
    stats = {}
    stats["corpus"] = os.path.basename(args.corpus.name)
    stats["srclang"] = args.srclang
    stats["trglang"] = args.trglang
    
    
    if args.corpus.name.endswith(".tsv"):
        filename = re.sub("\.tsv$", "", args.corpus.name)
        
        #filename=args.corpus.name.replace(".tsv","")
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
            
        #PII
        src_pii_matches = src_pii_proc(src_sent)
        try:
            next(src_pii_matches)
            src_pii += 1            
        except StopIteration:
            pass
            
        trg_pii_matches = trg_pii_proc(trg_sent)
        try:
            next(trg_pii_matches)
            trg_pii += 1
        except StopIteration:
            pass

    
        #Counting tokens in each sentence
        tokenized_src = src_tokenizer.tokenize(src_sent)
        tokenized_trg = trg_tokenizer.tokenize(trg_sent)

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
                    
        #Add tokens for each sentence
        src_tokens.extend(tokenized_src)
        for token in tokenized_src:
            if any(c.isalpha() for c in token):
                src_alpha_tokens.append(token)

        trg_tokens.extend(tokenized_trg)
        for token in tokenized_trg:
            if any(c.isalpha() for c in token):
                trg_alpha_tokens.append(token)

        #ngrams
        src_ngrams_dict, nwarning = get_line_ngrams(args.srclang, tokenized_src, 5, src_stopwords)        
        for w in nwarning:
            src_ngrams_warnings.add("src_"+w)        
        trg_ngrams_dict, nwarning = get_line_ngrams(args.trglang, tokenized_trg, 5, trg_stopwords)        
        for w in nwarning:
            trg_ngrams_warnings,add("trg_"+w)


        for g in src_ngrams_dict.get(1):
            src_onegrams_buffer.append(" ".join(g))
            src_onegrams_counter += 1
        for g in src_ngrams_dict.get(2):
            src_twograms_buffer.append(" ".join(g))
            src_twograms_counter += 1
        for g in src_ngrams_dict.get(3):
            src_threegrams_buffer.append(" ".join(g))
            src_threegrams_counter += 1
        for g in src_ngrams_dict.get(4): 
            src_fourgrams_buffer.append(" ".join(g))
            src_fourgrams_counter += 1
        for g in src_ngrams_dict.get(5):
            src_fivegrams_buffer.append(" ".join(g))
            src_fivegrams_counter += 1
        
        
        for g in trg_ngrams_dict.get(1):
            trg_onegrams_buffer.append(" ".join(g))
            trg_onegrams_counter += 1
        for g in trg_ngrams_dict.get(2):
            trg_twograms_buffer.append(" ".join(g))
            trg_twograms_counter += 1
        for g in trg_ngrams_dict.get(3):
            trg_threegrams_buffer.append(" ".join(g))
            trg_threegrams_counter += 1
        for g in trg_ngrams_dict.get(4): 
            trg_fourgrams_buffer.append(" ".join(g))
            trg_fourgrams_counter += 1
        for g in trg_ngrams_dict.get(5):
            trg_fivegrams_buffer.append(" ".join(g))
            trg_fivegrams_counter += 1


        #Write buffers to files:
        if src_onegrams_counter > 10000000:
            for g in src_onegrams_buffer:
                src_onegrams_file.write(g+"\n")
            src_onegrams_buffer = []
            src_onegrams_counter = 0
        if src_twograms_counter > 10000000:
            for g in src_twograms_buffer:
                src_twograms_file.write(g+"\n")
            src_twograms_buffer = []
            src_twograms_counter = 0
        if src_threegrams_counter > 10000000:
            for g in src_threegrams_buffer:
                src_threegrams_file.write(g+"\n")
            src_threegrams_buffer = []
            src_threegrams_counter = 0
        if src_fourgrams_counter > 1000000:
            for g in src_fourgrams_buffer:
                src_fourgrams_file.write(g+"\n")
            src_fourgrams_buffer = []
            src_fourgrams_counter = 0
        if src_fivegrams_counter > 1000000:
            for g in src_fivegrams_buffer:
                src_fivegrams_file.write(g+"\n")
            src_fivegrams_buffer = []
            src_fivegrams_counter = 0  
                
        if trg_onegrams_counter > 10000000:
            for g in trg_onegrams_buffer:
                trg_onegrams_file.write(g+"\n")
            trg_onegrams_buffer = []
            trg_onegrams_counter = 0
        if trg_twograms_counter > 10000000:
            for g in trg_twograms_buffer:
                trg_twograms_file.write(g+"\n")
            trg_twograms_buffer = []
            trg_twograms_counter = 0
        if trg_threegrams_counter > 10000000:
            for g in trg_threegrams_buffer:
                trg_threegrams_file.write(g+"\n")
            trg_threegrams_buffer = []
            trg_threegrams_counter = 0
        if trg_fourgrams_counter > 1000000:
            for g in trg_fourgrams_buffer:
                trg_fourgrams_file.write(g+"\n")
            trg_fourgrams_buffer = []
            trg_fourgrams_counter = 0
        if trg_fivegrams_counter > 1000000:
            for g in trg_fivegrams_buffer:
                trg_fivegrams_file.write(g+"\n")
            trg_fivegrams_buffer = []
            trg_fivegrams_counter = 0        
            
        # Corpus strings
        src_bytes += len(src_sent.encode('utf-8'))
        trg_bytes += len(trg_sent.encode('utf-8'))
        
        src_chars += len(src_sent)
        trg_chars += len(trg_sent)
    
    
    #Write remaining ngrams in buffers
    for g in src_onegrams_buffer:
        src_onegrams_file.write(g+"\n")
    for g in src_twograms_buffer:
        src_twograms_file.write(g+"\n")
    for g in src_threegrams_buffer:
        src_threegrams_file.write(g+"\n")
    for g in src_fourgrams_buffer:
        src_fourgrams_file.write(g+"\n")
    for g in src_fivegrams_buffer:
        src_fivegrams_file.write(g+"\n")
    for g in trg_onegrams_buffer:
        trg_onegrams_file.write(g+"\n")
    for g in trg_twograms_buffer:
        trg_twograms_file.write(g+"\n")
    for g in trg_threegrams_buffer:
        trg_threegrams_file.write(g+"\n")
    for g in trg_fourgrams_buffer:
        trg_fourgrams_file.write(g+"\n")
    for g in trg_fivegrams_buffer:
        trg_fivegrams_file.write(g+"\n")

    
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
        src_tokens_elements = sorted(src_sent_tokens.elements())
        stats["src_sent_tokens_mean"] = round(statistics.mean(src_tokens_elements))
        stats["src_sent_tokens_median"] = round(statistics.median(src_tokens_elements))
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
        trg_tokens_elements = sorted(trg_sent_tokens.elements())
        stats["trg_sent_tokens_mean"] = round(statistics.mean(trg_tokens_elements))
        stats["trg_sent_tokens_median"] = round(statistics.median(trg_tokens_elements))
    if len(trg_hashes_list) > 0:
        stats["trg_unique_sents"] = str(trg_hashes_list)


    #Language ID
    src_langs_list = []
    trg_langs_list = []
    src_langs_file = filename+"."+args.srclang+".langcounts"
    trg_langs_file = filename+"."+args.trglang+".langcounts"
    
    if not os.path.exists(src_langs_file):
         logging.warning("Language file " + src_langs_file  + " not found")
    else:
        for line in open(src_langs_file, "r"):
            lineparts = line.split()
            id_lang = lineparts[1].strip()
            count_lang = int(lineparts[0].strip())
            src_langs_list.append([id_lang, count_lang])
            
    if not os.path.exists(trg_langs_file):
         logging.warning("Language file " + trg_langs_file  + " not found")
    else:
        for line in open(trg_langs_file, "r"):
            lineparts = line.split()
            id_lang = lineparts[1].strip()
            count_lang = int(lineparts[0].strip())
            trg_langs_list.append([id_lang, count_lang])

            
    if len(src_langs_list) > 0:
        stats["src_langs"] = json.dumps(src_langs_list)
    if len(trg_langs_list) > 0:
        stats["trg_langs"] = json.dumps(trg_langs_list)


    # type token ratio
    try:
        ttr_src = round(len(set(src_alpha_tokens))/ len(src_alpha_tokens),2)
    except ZeroDivisionError:
        ttr_src = None
    try:
        ttr_trg = round(len(set(trg_alpha_tokens))/ len(trg_alpha_tokens),2)
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
    
    stats["src_chars"] = src_chars
    stats["trg_chars"] = trg_chars

    # bicleaner-hardrules tags
    if args.is_reversed:
        bicleaner_tags = read_hardrulestags(filename, args.yamlfile, args.trglang, args.srclang)
    else:
        bicleaner_tags = read_hardrulestags(filename, args.yamlfile, args.srclang, args.trglang)
    if total_lines > 0 :
        bicleaner_tags["pii"] = src_pii+trg_pii
    
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
    
    warnings.extend(src_ngrams_warnings)
    warnings.extend(trg_ngrams_warnings)

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
