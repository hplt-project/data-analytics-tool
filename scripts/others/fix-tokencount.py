import argparse
import yaml
import json 

parser = argparse.ArgumentParser()
parser.add_argument('yaml_file', help='YAML file to obtain the token count from.')
args = parser.parse_args()

total=0

with open(args.yaml_file, "r") as file:
    data =  yaml.load(file, Loader=yaml.FullLoader)
    token_distribution =json.loads( data.get("src_sent_tokens"))
    
  
    for tuple in token_distribution:
         total += (tuple[0]*tuple[1])
         

data["src_tokens"] = total

with open(args.yaml_file, "w") as file:
    yaml.dump(data,file)    