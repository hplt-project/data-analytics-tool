import sys
import json
import yaml

sample_file = sys.argv[1]
yaml_file = sys.argv[2]
mode = sys.argv[3] #docs, mono or parallel

    
stats = {}
sample_array = []


with open(sample_file, "r") as samples:
    for s in samples:
        if mode == "docs":
            sample_array.append(s.strip())    
        elif mode == "mono":
            sample_array.append({"src": s.strip()})
        elif mode == "parallel":
            parts = s.split("\t")
            sample_array.append({"src": parts[0].strip(), "trg": parts[1].strip()})
        else:
            sys.exit("Unsupported mode " + str(mode))
    
with open(yaml_file, "a", encoding="utf-8") as yf:
    stats["sample"] = json.dumps(sample_array, ensure_ascii=True)
    yaml.dump(stats, yf)
