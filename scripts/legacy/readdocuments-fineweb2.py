import time 
#import os
import sys
import logging
import traceback
import argparse
import yaml
import json
import tldextract
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
from datasets import  load_dataset


def initialization():
    parser = argparse.ArgumentParser()
    
    #parser.add_argument('hf_identifier', type=str, help="HuggingFace dataset identifier (i.e. 'HuggingFaceFW/fineweb-2')")
    parser.add_argument('subset', type=str, help="Subset of FineWeb-2 (i.e. 'cat_Latn')")
    #parser.add_argument('hf_split', type=str, help="Split of the subset (i.e. 'train')")
    
    #parser.add_argument('corpus', type=argparse.FileType('rt'), help="Corpus")
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
    doc_collections = Counter()
    doc_langs = Counter()
    docs_lm_avg = Counter()
    docs_tld = Counter()
    docs_domains = Counter()
    docs_scores = Counter() #docscorer aka Web Docs Scorer
    
    langident = heli_otr.Identifier()
    
    ds = docscorer.DocumentScorer()    
    dataset = load_dataset("HuggingFaceFW/fineweb-2", args.subset,  split="train",  streaming=True)        
 
    for doc in dataset :
        #keys are: dict_keys(['text', 'id', 'dump', 'url', 'date', 'file_path', 'language', 'language_score', 'language_script', 'minhash_cluster_size', 'top_langs'])
        '''
        text (string): the main text content
        id (string): original unique identifier for this sample from CommonCrawl
        dump (string): the CommonCrawl dump this sample was a part of
        url (string): url to the original page where text was present
        date (string): crawl date (from CommonCrawl)
        file_path (string): s3 path for the individual CommonCrawl warc file containing this sample
        language (string): ISO 639-3 code for the language of this sample
        language_script (string): script of the text, for example Latn
        language_score (float): language prediction score as reported by the GlotLID classifier
        top_langs: language-script pairs for which the language classifier
        minhash_cluster_size: number of samples in the minhash cluster of this sample. See the deduplication section to learn why this might be useful
        '''
        
        total_docs+=1
        #doc = json.load(json_line)  
              
        
        
        sents = doc.get("text").split("\n")
        url = doc.get("url")        #url = doc.get("u")
        collection = doc.get("dump")	#collection = doc.get("collection")
        docscores = None 	#docscores = doc.get("doc_scores") #There's no equivalent to this in FineWeb
        doc_lang = doc.get("language")
        #langs = doc.get("seg_langs")  #There's no equivalent to this in FineWeb
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

        #if args.fluency:
        #    for f in scores:
        #        #args.fluency.write(str(f)+"\n")
        #        args.fluency.write(str(math.floor(f*10)/10)+"\n") #Storing only one decimal point for disk space reasons

                
        #Document Score (Web Docs Scorer)
        if docscores == None:        
            ds_doc = {}
            ds_doc["document_lang"] = doc_lang + "_" + doc.get("language_script").lower()
            #ds_doc["langs"] = [doc_lang for x in range(len(sents))]
            ds_doc["langs"] = seg_langs
            ds_doc["text"] = doc.get("text")
            ds_doc["script"] = doc.get("language_script")
            ds_doc["id"] = None
            document_score = ds.score_document(ds_doc, logging=logging,  only_final_score=True)	
        else:
            document_score = docscores[0]
        docs_scores[document_score]+=1

        #Segments per document (docs_segments)         
        doc_length[len(sents)] += 1

        #Documents per collection (docs_collection)
        doc_collections[collection] += 1
        
        #Segments in the document language (docs_lang)
        #lang_matches = langs.count(args.srclang)
        

        if len(args.srclang) == 2:
            #The documents have 3-letter langcodes
            langobj = iso639.Lang(args.srclang)
            lang3 = langobj.pt3
        else:
            lang3 = args.srclang
        lang_matches = sum(1 for item in seg_langs if item.split("_")[0] == lang3) #this accepts both "hbs_cyr" and "hbs_lat" when target language is "hbs", for example
        lang_matches_rate = round((lang_matches/len(seg_langs)), 1)
        doc_langs[lang_matches_rate] += 1


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
        
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)
