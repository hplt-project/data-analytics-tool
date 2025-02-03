import time 
#import os
import sys
import logging
import traceback
import argparse
import yaml
import json
import math
#import cProfile
import statistics
import docscorer
import iso639
import heli_otr

from timeit import default_timer
from util import logging_setup
from collections import Counter
from statistics import mean
from urllib.parse import urlparse
#from ngrams import get_line_ngrams, get_stopwords
#from xxhash import xxh64
#from bicleanerscorer import read_hardrulestags, read_scores
#from tokenizer import CustomTokenizer
#from datasets import  load_dataset


def initialization():
    parser = argparse.ArgumentParser()
    
    #parser.add_argument('hf_identifier', type=str, help="HuggingFace dataset identifier (i.e. 'HuggingFaceFW/fineweb-2')")
    parser.add_argument('field', type=str, help="Field name of the documents text (i.e. 'text')")
    #parser.add_argument('hf_split', type=str, help="Split of the subset (i.e. 'train')")
    
    parser.add_argument('corpus', type=argparse.FileType('rt'), help="Corpus")
    parser.add_argument('tsvfile', type=argparse.FileType('wt'), help="TSV file")
    parser.add_argument('statsfile', type=str, help="Output YAML stats file.") #TODO: default tmpfile
    parser.add_argument('srclang', type=str, help="Source language")

    # Optionals
    groupO = parser.add_argument_group("Optional")
    groupO.add_argument('--langs', type=argparse.FileType('wt'), help="Save sentence languages in this file.")
    #groupO.add_argument('--fluency', type=argparse.FileType('wt'), help="Save sentence fluency scores in this file.")
    
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
    filename = "dummy" 
    
    warnings = []

    doc_length = Counter()
    #doc_collections = Counter()
    doc_langs = Counter()
    #docs_lm_avg = Counter()
    #docs_tld = Counter()
    #docs_domains = Counter()
    docs_scores = Counter() #docscorer aka Web Docs Scorer
    
    langident = heli_otr.Identifier()    
    ds = docscorer.DocumentScorer()    
     
    for json_line in args.corpus :
        '''
        Assuming the only key is args.field, containing the document text.
        '''
        
        total_docs+=1
        doc = json.loads(json_line)  
        
        sents = doc.get(args.field).split("\n")
        doc_lang = args.srclang
        seg_langs = []
        for s in sents:
            l = langident.identify(s)
            seg_langs.append(l)
             
                     
        if len(seg_langs) != len(sents):
            logging.debug("Langs: " + str(len(seg_langs)) + "; Segments: " + str(len(sents)) + "; Skipping")
            unmatching_docs+=1
            continue

        if args.langs:
            for l in seg_langs:
                args.langs.write(l+"\n")


        #Document Score (Web Docs Scorer)
        ds_doc = {}
        ds_doc["document_lang"] = doc_lang.lower()
        ds_doc["langs"] = seg_langs
        ds_doc["script"] = doc_lang.split("_")[1].lower()
        ds_doc["text"] = doc.get("text")
        ds_doc["id"] = doc.get("id") or None
        document_score = ds.score_document(ds_doc, logging=logging, only_final_score=True)	
        docs_scores[document_score]+=1

        #Segments per document (docs_segments)         
        doc_length[len(sents)] += 1


        if len(args.srclang) == 2:
            #The documents have 3-letter langcodes
            langobj = iso639.Lang(args.srclang)
            lang3 = langobj.pt3.lower()
        else:
            lang3 = args.srclang.lower()
        lang_matches = sum(1 for item in seg_langs if item.split("_")[0] == lang3.split("_")[0]) #this accepts both "hbs_cyr" and "hbs_lat" when target language is "hbs", for example
        lang_matches_rate = round((lang_matches/len(seg_langs)), 1)
        doc_langs[lang_matches_rate] += 1

        #Extract segmenmt for further segment processing
        for sent in sents:
            args.tsvfile.write(sent.strip()+"\n")            
            
    if unmatching_docs != 0:
        warnings.append("docs_unmatching_"+str(unmatching_docs))
        
    stats["docs_total"] = total_docs

    
    doc_length_list=[]   
    for segments, freq in sorted(doc_length.items()):
        doc_length_list.append([segments, freq])
    if len(doc_length_list)>0:
        doc_length_elements = sorted(doc_length.elements())
        stats["docs_segments_mean"] = round(statistics.mean(doc_length_elements))
        stats["docs_segments_median"] = round(statistics.median(doc_length_elements))
    

    langs_list = []
    for rate, freq in sorted(doc_langs.items()):
        langs_list.append([rate, freq])
        

    docscores_list=[]
    for docscore, freq in sorted(docs_scores.items()):
        docscores_list.append([docscore, freq])
    
    stats["docs_segments"] = json.dumps(doc_length_list)
    stats["docs_langs"] = json.dumps(langs_list)
    stats["docs_wds"] = json.dumps(docscores_list)
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
