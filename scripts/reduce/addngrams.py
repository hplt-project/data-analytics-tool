import sys
import json
import yaml

ngrams_file = sys.argv[1]
yaml_file = sys.argv[2]
side = sys.argv[3]

ngrams = {}
stats = {}

with open(ngrams_file, "r") as ngf:
    for line in ngf:
        lineparts = line.split("\t")
        ngram = lineparts[0].strip()
        ngram_freq = lineparts[1].strip()     
        ngram_order = lineparts[2].strip()
        
        if ngram_order not in ngrams.keys():
            ngrams[ngram_order] = []
        ngrams[ngram_order].append([[ngram], int(ngram_freq)])


with open(yaml_file, "a") as yf:
    if side == "src":     
        stats["src_ngrams"] = json.dumps(ngrams)    
    elif side=="trg": 
        stats["trg_ngrams"] = json.dumps(ngrams)  
    else:
        stats["ngrams"] = json.dumps(ngrams)  
    yaml.dump(stats, yf)

