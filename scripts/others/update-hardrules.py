import argparse
import yaml
import json 

parser = argparse.ArgumentParser()
parser.add_argument('yaml_file', help='YAML file to obtain the new hardrules count from.')
args = parser.parse_args()

data = None

with open(args.yaml_file, "r") as file:
    data =  yaml.load(file, Loader=yaml.FullLoader)
    
    total_sents = data.get("sentence_pairs")
    hardrules = json.loads(data.get("hardrules_tags"))
    new_hardrules =  {}
        
    for tag in hardrules:
        tag_percent = hardrules[tag]
        tag_count = int(total_sents * tag_percent / 100)
        new_hardrules[tag] = tag_count
    data["hardrules_tags"] = json.dumps(new_hardrules)
        

with open(args.yaml_file, "w") as file:
    yaml.dump(data,file)    

