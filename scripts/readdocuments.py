#import time 
import os
import io
import sys
import logging
import traceback
import argparse
#import yaml
import json
import tldextract
#import math
#import statistics
import docscorer
import iso639

#from timeit import default_timer
from util import logging_setup, print_in_column
#from collections import Counter
#from statistics import mean
from urllib.parse import urlparse

def initialization():
    parser = argparse.ArgumentParser(prog=os.path.basename(sys.argv[0]), formatter_class=argparse.ArgumentDefaultsHelpFormatter, description=__doc__)
    
    parser.add_argument('input', nargs='?', type=argparse.FileType('rt', errors="replace"), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input documents file.")
    parser.add_argument('srclang', type=str, help="Source language")
    parser.add_argument('output', nargs='?', type=argparse.FileType('wt'), default=sys.stdout, help="Output.")

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
    logging_setup(args)
    return args

def main():
    args = initialization() # Parsing parameters
    logging.info("Starting process")
    
    ds = docscorer.DocumentScorer()
        
    for json_line in args.input:
        doc = json.loads(json_line)         
    
        #Sentences
        sents = doc.get("text").split("\n")
        
        #Segments in the document
        doclength = len(sents)
        
        #Document languages (HELI)
        langs = doc.get("seg_langs")

        if len(langs) != len(sents):
            logging.debug("Langs: " + str(len(langs)) + "; Segments: " + str(len(sents)) + "; Skipping")
            #unmatching_docs+=1
            continue
        
        #Domain
        url = doc.get("u")
        
        #Collection
        collection = doc.get("collection")
        
        #WDS
        docscores = doc.get("doc_scores")
        if docscores == None:        
            document_score = ds.score_document(json_line, only_final_score=True)
        else:
            document_score = docscores[0]


        #Segments in the document language (docs_lang)
        if len(args.srclang) == 2:
            #The documents have 3-letter langcodes
            langobj = iso639.Lang(args.srclang)
            lang3 = langobj.pt3
        else:
            lang3 = args.srclang
        lang_matches = sum(1 for item in langs if item.split("_")[0] == lang3) #this accepts both "hbs_cyr" and "hbs_lat" when target language is "hbs", for example
        lang_matches_rate = round((lang_matches/len(langs)), 1)
        
        #Top-level domain and domain
        try:
            fulldomain = urlparse(url).netloc #This includes subdomain
            rawdomain = tldextract.extract(fulldomain).domain #This does not include subdomain
            tld = tldextract.extract(fulldomain).suffix #This is the TDL removing the preceeding dot
            domain = rawdomain+"."+tld
        except Exception as ex:            
            logging.error("Bad url: " + url)
            logging.error(ex)



        args.output.write("\t".join([str(doclength), str(document_score), str(lang_matches_rate), collection, domain, tld ]) + "\n")
        #Extract segments for further segment processing
        print_in_column(7, sents, args.output)

     #if unmatching_docs != 0:
     #	warnings.append("docs_unmatching_"+str(unmatching_docs))
       


    '''
    doc_length_list=[]   
    for segments, freq in sorted(doc_length.items()):
        doc_length_list.append([segments, freq])
    if len(doc_length_list)>0:
        doc_length_elements = sorted(doc_length.elements())
        stats["docs_segments_mean"] = round(statistics.mean(doc_length_elements))
        stats["docs_segments_median"] = round(statistics.median(doc_length_elements))
    
    collections_list=[]
    for collection, freq in sorted(doc_collections.items(), key=lambda pair:pair[1], reverse=True):
        collections_list.append([collection, freq])
        
    langs_list = []
    for rate, freq in sorted(doc_langs.items()):
        langs_list.append([rate, freq])
        

    tld_list = []
    for tld, freq in sorted(docs_tld.most_common(100), key=lambda pair:pair[1], reverse=True):
        tld_list.append([tld, freq])
        
    domains_list = []
    for domain, freq in sorted(docs_domains.most_common(100), key=lambda pair: pair[1], reverse=True):
        domains_list.append([domain, freq])
        
    docscores_list=[]
    for docscore, freq in sorted(docs_scores.items()):
        docscores_list.append([docscore, freq])
    
    stats["docs_segments"] = json.dumps(doc_length_list)
    stats["docs_collections"] = json.dumps(collections_list)
    stats["docs_langs"] = json.dumps(langs_list)
    stats["docs_top100_domains"] = json.dumps(domains_list)
    stats["docs_top100_tld"] = json.dumps(tld_list)    
    stats["docs_wds"] = json.dumps(docscores_list)
    stats["docs_warnings"] = warnings
    stats["docs_timestamp"] = time.time()
    
    write_stats(args.statsfile, stats)
    logging.info("Finished stats for "+ args.statsfile)
    elapsed_time = default_timer() - time_start
    logging.info("Total: {0} rows".format(total_docs))
    logging.info("Elapsed time {0:.2f} s".format(elapsed_time))
    logging.info("Troughput: {0} rows/s".format(int((total_docs*1.0)/elapsed_time)))
    '''    
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)
