import os
import re
import json
import io
import sys
import logging
import traceback
import argparse
import json
import tldextract
import docscorer
import iso639
import heli_otr


from util import logging_setup, print_in_column
from urllib.parse import urlparse

def initialization():
    parser = argparse.ArgumentParser(prog=os.path.basename(sys.argv[0]), formatter_class=argparse.ArgumentDefaultsHelpFormatter, description=__doc__)
    
    parser.add_argument('input', nargs='?', type=argparse.FileType('rt', errors="replace"), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input documents file.")
    parser.add_argument('srclang', type=str, help="Source language")
    parser.add_argument('output', nargs='?', type=argparse.FileType('wt'), default=sys.stdout, help="Output.")

    # Optionals
    groupO = parser.add_argument_group("Optional")
    groupO.add_argument('--langs', type=argparse.FileType('wt'), help="Save sentence languages in this file.")
    groupO.add_argument('--format', type=str, help="Document format.", choices=["hplt", "nemotron", "fineweb", "madlad"])
    
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
    
    text_field=None
    seglangs_field=None
    url_field=None
    collection_field=None
    wds_field=None


    if args.format == "hplt":
        text_field="text"
        seglangs_field="seg_langs"
        url_field="u"
        collection_field="collection"
        wds_field="doc_scores"
    elif args.format=="nemotron":
        text_field="text"        
        url_field="url"
    elif args.format=="fineweb":
        text_field="text"
        url_field="url"
        collection_field="dump"
    elif args.format=="madlad":
        text_field="text"
        
        
    langident = heli_otr.Identifier()
    ds = docscorer.DocumentScorer()

    domain_cache = {}
    
    for json_line in args.input:
        doc = json.loads(json_line)
    
        #Sentences
        #raw_sents = doc.get(text_field).split("\n")
        raw_sents = re.split(r'\\n|\n', doc.get(text_field))
        sents = []
        for s in raw_sents:
            if len(s) > 0:
                sents.append(s)
                
        
        #Segments in the document
        doclength = len(sents)	
        
        #Document languages (HELI)
        langs=[]
        if seglangs_field != None:
            langs = doc.get(seglangs_field)
        if (seglangs_field == None) or (len(langs) != len(sents)):
            for s in sents:
                l = langident.identify(s)
                langs.append(l)

        
        #Collection
        collection="unk"
        if collection_field != None:
            collection = doc.get(collection_field)
        
        #Segments in the document language (docs_lang)
        if len(args.srclang) == 2:
            #The documents have 3-letter langcodes
            langobj = iso639.Lang(args.srclang)
            lang3 = langobj.pt3
        else:
            lang3 = args.srclang
        lang_matches = sum(1 for item in langs if item.split("_")[0] == lang3) #this accepts both "hbs_cyr" and "hbs_lat" when target language is "hbs", for example
        lang_matches_rate = round((lang_matches/len(langs)), 1)

        #WDS
        if wds_field != None:
            docscores = doc.get(wds_field)
            document_score = docscores[0]
        else:
            ds_doc = {}
            if args.format=="hplt":
                ds_doc["document_lang"] = lang3
                ds_doc["langs"] = langs
                ds_doc["text"] = ("\n").join(sents)
                ds_doc["script"] = doc.get("lang")[0].split("_")[1].lower()
                ds_doc["id"] = doc.get("id")
            elif args.format=="nemotron":
                ds_doc["document_lang"] = "eng" #Nemotron is always English for now
                ds_doc["langs"] = langs
                ds_doc["text"] = ("\n").join(sents)
                ds_doc["script"] = "latn"
                ds_doc["id"] = doc.get("warc_record_id")
            elif args.format=="fineweb":
                ds_doc["document_lang"] = doc.get("language") # + "_" + doc.get("language_script").lower()
                ds_doc["langs"] = langs
                ds_doc["text"] = ("\n").join(sents)
                ds_doc["script"] = doc.get("language_script").lower()
                ds_doc["id"] = doc.get("id")       
            elif args.format=="madlad":
                ds_doc["document_lang"] = lang3
                ds_doc["langs"] = langs
                ds_doc["text"] = ("\n").join(sents)
                ds_doc["script"] = "latn"
                ds_doc["id"] = doc.get("id")
    
            document_score = ds.score_document(ds_doc, raw_score=True) 
            #document_score = ds.score_document(json_line, only_final_score=True)
 
        #Top-level domain and domain
        #Domain
        tld = ""
        domain = ""
        if url_field:
            url = doc.get(url_field)
            try:
                fulldomain = urlparse(url).netloc #This includes subdomain
                if fulldomain in domain_cache:
                    domain, tld = domain_cache[fulldomain]
                else:
                    extract_res = tldextract.extract(fulldomain)
                    rawdomain = extract_res.domain #This does not include subdomain
                    tld = extract_res.suffix #This is the TDL removing the preceeding dot
                    domain = rawdomain + "." + tld
                    domain_cache[fulldomain] = (domain, tld)
            except Exception as ex:
                logging.error("Bad url: " + url)
                logging.error(ex)

        args.output.write("\t".join([str(doclength), str(document_score), str(lang_matches_rate), collection, domain, tld ]) + "\n")
        #Extract segments for further segment processing
        print_in_column(7, sents, args.output)

     #if unmatching_docs != 0:
     #	warnings.append("docs_unmatching_"+str(unmatching_docs))
       
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)
