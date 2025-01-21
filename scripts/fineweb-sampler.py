import re
import json

from datasets import  load_dataset

langsfile  = open("langs.txt", "r")
langs = json.load(langsfile)

samples={}


for l in langs:
    langcode = l.get("lang_code")
    print(langcode)
    try:
        dataset = load_dataset("HuggingFaceFW/fineweb-2", langcode,  split="test",  streaming=True)        
    except ValueError:
        print(langcode + " dataset not available")
        continue
    sample = dataset.shuffle()
    docs = []
    for s in sample:
        docs.append(s.get("text"))
        if len(docs)>=20:        
            break
    samples[langcode] = docs
        

with open("fineweb.js", "w") as samplesfile:
    json.dump(samples, samplesfile, indent=4)

    