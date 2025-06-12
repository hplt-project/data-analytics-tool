import sys
import json
import argparse
import traceback
import logging
import yaml
import statistics
from collections import Counter


def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.") 
    parser.add_argument('volumesfile', type=argparse.FileType('r'), help="Volumes file.")
    parser.add_argument('docsentsfile', type=argparse.FileType('r'), help="Sentences per document file.")
    parser.add_argument('wdsfile', type=argparse.FileType('r'), help="WDS scores file.")
    parser.add_argument('docslangsfile', type=argparse.FileType('r'), help="Document langs file.")
    parser.add_argument('collectionsfile', type=argparse.FileType('r'), help="Collections file.")
    parser.add_argument('domainsfile', type=argparse.FileType('r'), help="Domains file.")
    parser.add_argument('tldsfile', type=argparse.FileType('r'), help="TLDs file.")
    
    args = parser.parse_args()
    return args
    
def main():    
    args = initialization()
    stats = {}

    #Volumes
    volumes_line = args.volumesfile.readline()
    volumes = volumes_line.strip().split("\t")
    assert len(volumes) == 2, "Missing parts in the volumes file"
    stats["docs_total"] = int(volumes[0])
    #stats["docs_segments"] = int(volumes[1])
       
    #Document sentences
    docs_sents = Counter()
    docs_sents_list = []
    for line in args.docsentsfile:
        parts = line.strip().split()
        if len(parts) < 2:
            continue
        freq = parts[0]
        sents = parts[1]
        docs_sents[int(sents)] = int(freq)
        docs_sents_list.append([int(sents), int(freq)])
    stats["docs_segments"] = str(docs_sents_list)
    docs_sents_elements = sorted(docs_sents.elements())
    stats["docs_segments_mean"] = round(statistics.mean(docs_sents_elements))
    stats["docs_segments_median"] = round(statistics.median(docs_sents_elements))
    
    
    #WDS
    wds = []
    for line in args.wdsfile:
        parts = line.strip().split()
        if len(parts) < 2:
            continue
        freq = parts[0]
        score = parts[1]
        wds.append([float(score), int(freq)])
    stats["docs_wds"] = json.dumps(wds)
    
    #Doc langs
    docs_langs = []
    for line in args.docslangsfile:
        parts = line.strip().split()
        if len(parts) < 2:
            continue
        freq = parts[0]
        ratio = parts[1]
        docs_langs.append([float(ratio), int(freq)])
    stats["docs_langs"] = json.dumps(docs_langs)

    #Collections
    docs_collections = []
    for line in args.collectionsfile:
        parts = line.strip().split()
        if len(parts) < 2:
            continue
        freq = parts[0]
        collection = parts[1]
        docs_collections.append([collection, int(freq)])
    stats["docs_collections"] = json.dumps(docs_collections)
    
    #Domains
    docs_top100_domains = []
    for line in args.domainsfile:
        parts = line.strip().split()
        if len(parts) < 2 :
            continue
        freq = parts[0]
        domain = parts[1]
        docs_top100_domains.append([domain, int(freq)])
        if len(docs_top100_domains) >= 100:
            break
    stats["docs_top100_domains"] = json.dumps(docs_top100_domains)
    
    #TLDs
    docs_top100_tld = []
    for line in args.tldsfile:
        parts = line.strip().split()
        if len(parts) < 2 :
            continue
        freq = parts[0]
        tld = parts[1]
        docs_top100_tld.append([tld, int(freq)])
        if len(docs_top100_tld) >= 100:
            break
    stats["docs_top100_tld"] = json.dumps(docs_top100_tld)
    

    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)