import argparse
import yaml
import json 

parser = argparse.ArgumentParser()
parser.add_argument('yaml_file', help='YAML file to obtain the new hardrules count from.')
args = parser.parse_args()

with open(args.yaml_file, "r") as file:
    data =  yaml.load(file, Loader=yaml.FullLoader)
    total_sents = data.get("sentence_pairs")
    hardrules = json.loads(data.get("hardrules_tags"))
    
    for tag in hardrules:
        tag_percent = hardrules[tag]
        tag_count = int(total_sents * tag_percent / 100)
        print("Total: " + str(total_sents))
        print(tag + ": " + str(tag_percent) + " --> " + str(tag_count))
        
         

#data["src_tokens"] = total

#with open(args.yaml_file, "w") as file:
#    yaml.dump(data,file)    

