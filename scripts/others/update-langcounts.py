'''
L=az; wget -i https://data.hplt-project.org/one/monotext/cleaned/$L"_map".txt &&  zstdcat $L"_"*.jsonl.zst | jq .langs -r | grep -Ev  "\[|\]" | tr -d '",'   | sort  --parallel $JOBS  | uniq -c | sort -nr | python3.10 update-langcount.py - /work/yaml_dir/HPLT-docslite.$L.yaml
'''


import sys
import json
import argparse
import yaml 

parser = argparse.ArgumentParser()
parser.add_argument('yaml_file', help='YAML file where to save the langcounts stats.')
args = parser.parse_args()


with open(args.yaml_file, "r") as file:
    data =  yaml.load(file, Loader=yaml.FullLoader)

src_langs_list = []

for line  in sys.stdin:
    lineparts = line.split()
    id_lang = lineparts[1].strip()
    count_lang = int(lineparts[0].strip())
    src_langs_list.append([id_lang, count_lang])

data["src_langs"] = json.dumps(src_langs_list)

with open(args.yaml_file, "w") as file:
    yaml.dump(data,file)    





