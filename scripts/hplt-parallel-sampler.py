import sys
import json
import glob

samplefiles = []
samples = {}

for file in glob.glob("/work/uploaded_corpora/sample*"):
    samplefiles.append(file)


for file in samplefiles:
    langsamples = []
    langpair = file.split(".")[-1]

    with open(file, "r") as samplesfile:        
        for line in samplesfile:
            parts = line.strip().split("\t")
            segment = {"src": parts[0], "trg": parts[1], "score": parts[2]}
            langsamples.append(segment)
    samples[langpair] = langsamples


with open("hplt-parallel.js", "w", encoding="utf-8") as samplesfile:
    json.dump(samples, samplesfile, indent=4, ensure_ascii=False)