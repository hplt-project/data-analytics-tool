'''
L=az; wget -i https://data.hplt-project.org/one/monotext/cleaned/$L"_map".txt &&  zstdcat $L"_"*.jsonl.zst | jq .scores -r | grep -Ev  "\[|\]" | tr -d '",'   | python3.10 /work/scripts/others/update-fluencyscores.py /work/yaml_dir/HPLT-docslite.$L.yaml
'''


import sys
import json
import argparse
import yaml 



parser = argparse.ArgumentParser()
parser.add_argument('yaml_file', help='YAML file where to save the fluency score stats.')
args = parser.parse_args()


with open(args.yaml_file, "r") as file:
    data =  yaml.load(file, Loader=yaml.FullLoader)

buckets = [[] for _ in range(10)]        

for line  in sys.stdin:
    score = line.strip()
    try:
        bucket_index = int(float(score) * 10)
        buckets[bucket_index].append(score)
    except IndexError as ex:
        if bucket_index == 10:
            buckets[9].append(score) #score was 1.000, add to last bucket
        else:
            print(ex, file=sys.stderr)
                

bucket_counts = [[i / 10, len(bucket)] for i, bucket in enumerate(buckets)]

data["monocleaner_scores"] = json.dumps(bucket_counts)

with open(args.yaml_file, "w") as file:
    yaml.dump(data,file)    





