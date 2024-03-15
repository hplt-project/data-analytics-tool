import time 
#import os
import sys
import logging
import traceback
import argparse
import yaml
import json
import tldextract
#import math
#import cProfile
#import statistics

from timeit import default_timer
from util import logging_setup
from collections import Counter
from statistics import mean
from urllib.parse import urlparse
#from ngrams import get_line_ngrams, get_stopwords
#from xxhash import xxh64
#from bicleanerscorer import read_hardrulestags, read_scores
#from tokenizer import CustomTokenizer

def initialization():
    parser = argparse.ArgumentParser()
    
    parser.add_argument('corpus', type=argparse.FileType('rt'), help="Corpus")
    parser.add_argument('tsvfile', type=argparse.FileType('wt'), help="TSV file")
    parser.add_argument('statsfile', type=str, help="Output YAML stats file.") #TODO: default tmpfile
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
    with open(statsfile, "w") as f:
        yaml.dump(statsdict,f)
'''
# To convert sizes
def convert_size(size_bytes):
   if size_bytes == 0:
       return "0B"
   size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
   i = int(math.floor(math.log(size_bytes, 1024)))
   p = math.pow(1024, i)
   s = round(size_bytes / p, 2)
   return "%s %s" % (s, size_name[i])
'''

def main():
    args = initialization() # Parsing parameters
    logging_setup(args)
    logging.info("Starting process")
    time_start = default_timer()
    
    total_docs=0
    unmatching_docs=0

    #Pure metadata could be in a different function
    stats = {}
    #stats["srclang"] = args.srclang
    filename = args.corpus.name    
    
    warnings = []

    doc_length = Counter()
    doc_collections = Counter()
    doc_langs = Counter()
    docs_lm_avg = Counter()
    docs_tld = Counter()
    docs_domains = Counter()
    
    for json_line in args.corpus :
        total_docs+=1
        doc = json.loads(json_line)
        scores = doc.get("scores")
        langs = doc.get("langs")
        sents = doc.get("text").split("\n")
        url = doc.get("url")
        collection = doc.get("collection")
        
        if (len(scores) != len(sents)) or (len(langs) != len(sents)):
            logging.debug("Scores: " + str(len(scores)) + "; Langs: " + str(len(langs)) + "; Segments: " + str(len(sents)) + "; Skipping")
            unmatching_docs+=1
            continue

        #Segments per document (docs_segments)         
        doc_length[len(scores)] += 1

        #Documents per collection (docs_collection)
        doc_collections[collection] += 1
        
        #Segments in the document language (docs_lang)
        lang_matches = langs.count(args.srclang)
        lang_matches_rate = round((lang_matches/len(langs)), 1)
        doc_langs[lang_matches_rate] += 1

        #Average LM score per document (docs_lm_avg)        
        lm_mean = round(mean(scores), 1)
        docs_lm_avg[lm_mean] += 1
        
        #Top-level domain and domain
        try:
            #domain = url.replace("http://", "").replace("https://", "").replace("www.", "").split("/")[0]
            #tld = domain.split["."][-1]
            fulldomain = urlparse(url).netloc #This includes subdomain
            domain = tldextract.extract(fulldomain).domain #This does not include subdomain
            tld = tldextract.extract(fulldomain).suffix #This is the TDL removing the preceeding dot
            
            docs_tld[tld] += 1
            docs_domains[domain+"."+tld] += 1
        except Exception as ex:            
            logging.error("Bad url: " + url)
            logging.error(ex)

        #Extract segmenmt for further segment processing
        for sent in sents:
            args.tsvfile.write(sent.strip()+"\n")            
            
    if unmatching_docs != 0:
        warnings.append("docs_unmatching_"+str(unmatching_docs))
        
    stats["docs_total"] = total_docs

    doc_length_list=[]   
    for segments, freq in sorted(doc_length.items()):
        doc_length_list.append([segments, freq])
    
    collections_list=[]
    for collection, freq in sorted(doc_collections.items(), key=lambda pair:pair[1], reverse=True):
        collections_list.append([collection, freq])
        
    langs_list = []
    for rate, freq in sorted(doc_langs.items()):
        langs_list.append([rate, freq])
        
    lm_avg_list = []
    for lm, freq in sorted(docs_lm_avg.items()):
        lm_avg_list.append([lm, freq])
        
    tld_list = []
    for tld, freq in sorted(docs_tld.items(), key=lambda pair:pair[1], reverse=True):
        tld_list.append([tld, freq])
        
    domains_list = []
    for domain, freq in sorted(docs_domains.most_common(100), key=lambda pair: pair[1], reverse=True):
        domains_list.append([domain, freq])
    
    stats["docs_segments"] = json.dumps(doc_length_list)
    stats["docs_collections"] = json.dumps(collections_list)
    stats["docs_langs"] = json.dumps(langs_list)
    stats["docs_avg_lm"] = json.dumps(lm_avg_list)
    stats["docs_domains"] = json.dumps(domains_list)
    stats["docs_tld"] = json.dumps(tld_list)    
    stats["docs_warnings"] = warnings
    stats["docs_timestamp"] = time.time()

    write_stats(args.statsfile, stats)
    logging.info("Finished stats for "+ args.statsfile)
    elapsed_time = default_timer() - time_start
    logging.info("Total: {0} rows".format(total_docs))
    logging.info("Elapsed time {0:.2f} s".format(elapsed_time))
    logging.info("Troughput: {0} rows/s".format(int((total_docs*1.0)/elapsed_time)))
        
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)
