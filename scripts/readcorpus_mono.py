import time 
import os
import sys
import logging
import traceback
import argparse
import yaml
import json
import math
import cProfile
import statistics
from iso639 import Lang


from pii_manager import PiiEnum
from pii_manager.api import PiiManager
from pii_manager.lang import COUNTRY_ANY

from timeit import default_timer
from util import logging_setup, get_fastspell_langs
from collections import Counter
from ngrams import get_line_ngrams, get_stopwords
from xxhash import xxh64
from bicleanerscorer import read_hardrulestags, read_scores
from tokenizer import CustomTokenizer

def initialization():
    parser = argparse.ArgumentParser()
    
    parser.add_argument('corpus', type=argparse.FileType('rb'), help="Corpus name. Prefix to the source and target bitexts.")
    parser.add_argument('statsfile', type=str, help="Output YAML stats file.") #TODO: default tmpfile
    parser.add_argument('srclang', type=str, help="Source language")
    
    # Optionals
    groupO = parser.add_argument_group("Optional")
    groupO.add_argument('--lite', action="store_true", help="Process only lightweight stats")
    
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
    with open(statsfile, "a") as f:
        yaml.dump(statsdict,f)



#Currently a dummy
#def count_tokens(sent):
#    return(len(sent.split(" ")))

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
    src_alpha_tokens = []
    src_hashes =  {}
    sent_hashes = set()
    
    src_bytes=0
    
    src_chars=0

    src_pii=0
    
    #PII
    pii_isolang = Lang(args.srclang.split('_')[0])
    if pii_isolang.pt3 == 'hbs':
        pii_lang = 'hbs'
    elif not pii_isolang.pt1:
        pii_lang = 'any'
    else:
        pii_lang = pii_isolang.pt1

    pii_country = COUNTRY_ANY
    pii_tasklist = (PiiEnum.IP_ADDRESS, PiiEnum.EMAIL_ADDRESS, PiiEnum.PHONE_NUMBER)
    pii_proc = PiiManager(pii_lang, pii_country, tasks=pii_tasklist, mode="extract")
    
    #Pure metadata could be in a different function
    stats = {}
    stats["corpus"] = os.path.basename(args.corpus.name)
    stats["srclang"] = args.srclang
    filename = args.corpus.name
    

    src_tokenizer = CustomTokenizer(args.srclang)
    
    logging.info("Tokenizing " + args.srclang + " with " +src_tokenizer.toktype + " (" + str(src_tokenizer.getWarnings()) +")" )

    warnings = []
    nwarnings = src_tokenizer.getWarnings()
    for w in nwarnings:
        warnings.append("src_"+w)
        
    #src_file=open(args.corpus.name,"r").read().splitlines()

    #ngrams files
    onegrams_file = open(args.corpus.name + ".one", "w")
    twograms_file = open(args.corpus.name + ".two", "w")
    threegrams_file = open(args.corpus.name + ".three", "w")
    fourgrams_file = open(args.corpus.name + ".four", "w")
    fivegrams_file = open(args.corpus.name + ".five", "w")


    onegrams_buffer = []
    twograms_buffer = []
    threegrams_buffer = []
    fourgrams_buffer =  []
    fivegrams_buffer = []
    
    onegrams_counter = 0
    twograms_counter = 0
    threegrams_counter = 0
    fourgrams_counter = 0
    fivegrams_counter = 0
    
    ngrams_warnings = set()    
    stopwords, nwarnings = get_stopwords(args.srclang)
    for w in nwarnings:
        ngrams_warnings.add("src_"+w)


    if (args.srclang not in get_fastspell_langs()):
        warnings.append("src_fastspell")    

    logging.debug("Starting reading corpus")
    
    for i, line_bytes in enumerate(args.corpus):

        try:
            src_line = line_bytes.decode("utf8")
        except UnicodeDecodeError:
          print(f"WARN: encoding error in line {i}", file=sys.stderr)
          continue
          
        total_lines = total_lines+1
        src_line = src_line.strip()

        pii_matches = pii_proc(src_line)
        try:
            next(pii_matches)
            src_pii += 1            
        except StopIteration:
            pass

        if not args.lite:               
            tokenized_src = src_tokenizer.tokenize(src_line)
            #Counting tokens in each sentence        
            src_tokens_count = len(tokenized_src)
            src_sent_tokens[src_tokens_count] += 1

        
            #Add tokens for each sentence
            src_tokens.extend(tokenized_src) 
            for token in tokenized_src:
                if any(c.isalpha() for c in token):
                    src_alpha_tokens.append(token)
                
        
            #ngrams

            ngrams_dict, nwarning = get_line_ngrams(args.srclang, tokenized_src, 5, stopwords)        
            for w in nwarning:
                ngrams_warnings.add("src_"+w)
        
            for g in ngrams_dict.get(1):
                onegrams_buffer.append("".join(g))
                onegrams_counter += 1
                #onegrams_file.write(" ".join(g)+"\n")
            for g in ngrams_dict.get(2):
                twograms_buffer.append(" ".join(g))
                twograms_counter += 1
                #twograms_file.write(" ".join(g)+"\n")
            for g in ngrams_dict.get(3):
                threegrams_buffer.append(" ".join(g))
                threegrams_counter += 1
                #threegrams_file.write(" ".join(g)+"\n")
            for g in ngrams_dict.get(4): 
                fourgrams_buffer.append(" ".join(g))
                fourgrams_counter += 1
                #fourgrams_file.write(" ".join(g)+"\n")
            for g in ngrams_dict.get(5):
                fivegrams_buffer.append(" ".join(g))
                fivegrams_counter += 1
                #fivegrams_file.write(" ".join(g)+"\n")
                
            #Write buffers to files:
            if onegrams_counter > 10000000:
                for g in onegrams_buffer:
                    onegrams_file.write(g+"\n")
                onegrams_buffer = []
                onegrams_counter = 0
            if twograms_counter > 10000000:
                for g in twograms_buffer:
                    twograms_file.write(g+"\n")
                twograms_buffer = []
                twograms_counter = 0
            if threegrams_counter > 1000000:
                for g in threegrams_buffer:
                    threegrams_file.write(g+"\n")
                threegrams_buffer = []
                threegrams_counter = 0
            if fourgrams_counter > 1000000:        
                for g in fourgrams_buffer:
                    fourgrams_file.write(g+"\n")
                fourgrams_buffer = []
                fourgrams_counter = 0
            if fivegrams_counter > 1000000:
                for g in fivegrams_buffer:
                    fivegrams_file.write(g+"\n")
                fivegrams_buffer = []
                fivegrams_counter = 0


            
        #src hashes        
        if not args.lite:
            src_hash = xxh64(src_line).hexdigest()        
            try:	
                 src_hashes[src_tokens_count].add(src_hash)
            except KeyError:
                 src_hashes[src_tokens_count]=set()
                 src_hashes[src_tokens_count].add(src_hash)
        
            sent_hashes.add(src_hash)
        #End of non-lite stats               
        
        
        # Corpus strings
        src_bytes += len(src_line.encode('utf-8'))
        
        src_chars += len(src_line)

    if not args.lite:
        #Write remaining ngrams in buffers
        for g in onegrams_buffer:
            onegrams_file.write(g+"\n")
        for g in twograms_buffer:
            twograms_file.write(g+"\n")
        for g in threegrams_buffer:
            threegrams_file.write(g+"\n")
        for g in fourgrams_buffer:
            fourgrams_file.write(g+"\n")
        for g in fivegrams_buffer:
            fivegrams_file.write(g+"\n")
    
    logging.debug("Done reading corpus")
          
    stats["sentence_pairs"] = total_lines
    stats["unique_sents"] = len(sent_hashes)
    
        
    src_tokens_list = []
    src_hashes_list = []
    
    logging.debug("Sorting token frequencies")
    for token, freq in sorted(src_sent_tokens.items()):
        src_tokens_list.append([token, freq])
        try:
            src_hashes_list.append([token, len(src_hashes[token])])
        except KeyError:
            src_hashes_list.append([token, 0])
            
    if len(src_tokens_list) > 0:
        stats["src_sent_tokens"] = str(src_tokens_list)
        logging.debug("Sorting src sent tokens")
        src_tokens_elements = sorted(src_sent_tokens.elements())
        stats["src_sent_tokens_mean"] = round(statistics.mean(src_tokens_elements))
        stats["src_sent_tokens_median"] = round(statistics.median(src_tokens_elements))
    if len(src_hashes_list) > 0:
        stats["src_unique_sents"] = str(src_hashes_list)

    src_langs_list = []
    langs_file = filename+"."+args.srclang+".langcounts"
    
    if not os.path.exists(langs_file):
         logging.warning("Language file " + langs_file  + " not found")
    else:
        logging.debug("Reading language file")
        for line in open(langs_file, "r"):
            lineparts = line.split()
            id_lang = lineparts[1].strip()
            count_lang = int(lineparts[0].strip())
            src_langs_list.append([id_lang, count_lang])
       
    # for lang, freq in src_langs.most_common():
    #     src_langs_list.append([lang, freq])
    if len(src_langs_list) > 0:
        stats["src_langs"] = json.dumps(src_langs_list)
   
    #Register labels
    rl_dict = {}
    rl_file = filename+".rlcounts"

    if not os.path.exists(rl_file):
         logging.warning("Register labels file " + rl_file  + " not found")
    else:
        logging.debug("Reading register labels file")
        for line in open(rl_file, "r"):
            lineparts = line.split()
            rl_id = lineparts[1].strip()
            rl_count = int(lineparts[0].strip())
            rl_dict[rl_id]=rl_count
    if len(rl_dict) > 0:
        stats["register_labels"] = json.dumps(rl_dict)


    # ngrams
    '''
    src_ngrams, ngrams_warnings = get_ngrams(args.srclang, src_tokens, 5)
    if len(src_ngrams) > 0 :
        stats["src_ngrams"] = json.dumps(src_ngrams)
    '''
    warnings.extend(ngrams_warnings)
    
    #source tokens

    if len(src_tokens) > 0:
        stats["src_tokens"] = len(src_tokens)
    else: 
        total = 0
        for l in src_sent_tokens:
            total += l * src_sent_tokens[l]
        stats["src_tokens"] = total


    # type token ratio
    #logging.info(str(len(src_alpha_tokens)))
    #logging.info(str(len(set(src_alpha_tokens))))
    #if not args.lite:
    #    ttr_src = round(len(set(src_alpha_tokens))/ len(src_alpha_tokens),2)
    #    stats["ttr_src"] = ttr_src

    # bytes size
    stats["src_bytes"] = convert_size(src_bytes)

    stats["src_chars"] = src_chars
    
    #hardrules annotations
    logging.debug("Reading hardrules tags")
    monocleaner_tags = read_hardrulestags(filename, "",  args.srclang)
    if total_lines > 0 :
        monocleaner_tags["pii"] = src_pii
        
    if len(monocleaner_tags) > 0 :
        stats["hardrules_tags"] = json.dumps(monocleaner_tags)
    
    # monocleaner scores    
    #logging.debug("Reading monocleaner scores")
    #monocleaner_scores = read_scores(filename)
    #if len(monocleaner_scores) > 0 :
    #    stats["monocleaner_scores"] = json.dumps(monocleaner_scores)

    stats["warnings"] = warnings

    stats["timestamp"]=time.time()

    logging.debug("Writing stats")
    write_stats(args.statsfile, stats)
    logging.info("Finished stats for "+ args.statsfile)
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
