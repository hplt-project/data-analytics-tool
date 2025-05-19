import os
import sys
import argparse
import traceback
import logging
import json
import yaml


tag_types = [
    #"no_empty",                    # Sentence is empty (already in histogram)
    "not_too_long",                # Sentence is more than 1024 characters long
    "not_too_short",               # Sentence is less than 3 words long
    "length_ratio",                # The length ratio between the source sentence and target sentence (in bytes) is too low or too high
    #"no_identical",                # Alphabetic content in source sentence and target sentence is identical
    #"no_literals",                 # Unwanted literals: "Re:", "{{", "%s", "}}", "+++", "***", '=\"'
    #"no_only_symbols",             # The ratio of non-alphabetic characters in source sentence is more than 90% (already in OpusFilter)
    #"no_only_numbers",             # The ratio of numeric characters in source sentence is too high (already in OpusFilter)
    "no_urls",                     # There are URLs (disabled by default)
    #"no_breadcrumbs",              # There are more than 2 breadcrumb characters in the sentence
    #"no_glued_words",              # There are words in the sentence containing too many uppercased characters between lowercased characters
    #"no_repeated_words",           # There are more than 1 consecutive words repeated
    #"no_unicode_noise",            # Too many characters from unwanted unicode in source sentence
    #"no_space_noise",              # Too many consecutive single characters separated by spaces in the sentence (excludes digits)
    #"no_paren",                    # Too many parenthesis or brackets in sentence
    #"no_escaped_unicode",          # There are unescaped unicode characters in the sentence
    "no_bad_encoding",             # Source sentence or target sentence contains mojibake
    #"no_titles",                   # All words in source sentence or target sentence are uppercased or in titlecase
    #"no_wrong_language",           # Sentence is not in the desired language
    "no_porn",                     # Source sentence or target sentence contains text identified as porn
    #"no_number_inconsistencies",   # Sentence contains different numbers in source and target (disabled by default)
    #"no_script_inconsistencies",   # Sentence source or target contains characters from different script/writing systems (disabled by default)
    #"lm_filter"                    # The sentence pair has low fluency score from the language model
]

def remove_porntag(modelpath):
    # Check if there is porn file, otherwise remove it:

    if not modelpath or not os.path.exists(modelpath):
        tag_types.remove("no_porn")
        return tag_types
            
     # Load the YAML content
    with open(modelpath, 'r') as yf:
        yaml_data = yaml.safe_load(yf)
        
        # Check if "porn_removal_file" key exists
        if "porn_removal_file" not in yaml_data:
            tag_types.remove("no_porn")
    return tag_types
    

def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('hardrulesfile', type=argparse.FileType('r'), help="Input hardrules tags file")
    parser.add_argument('yamlfile', type=argparse.FileType('r+'), help="Output YAML stats file.") 
    parser.add_argument('modelyamlfile', nargs='?', type=str, default=None, help="Path to bicleaner model yaml file")
    args = parser.parse_args()
    return args
    
def main():    
    args = initialization()
    stats = {}

    yamldata =  yaml.load(args.yamlfile, Loader=yaml.FullLoader)
    
    src_pii = yamldata.get("src_pii")
    trg_pii = yamldata.get("trg_pii")
    
    tag_types = remove_porntag(args.modelyamlfile)

    tags_count = {}

    for t in tag_types:
        tags_count[t]=0

    for line in args.hardrulesfile:
        try:
            hr_score, tags = line.split("\t")                    
            if tags.strip() == "keep":
                continue
                
            if "+" in tags:
                moretags = list(set(tags.strip().split("+"))) # when there is more than one tag in the same sentence, just count the different type of tags
                for tag in moretags:                    
                    tag = tag.strip().replace("(right)","").replace("(left)","").replace("(left,right)","")
                    if tag in tags_count.keys():
                        tags_count[tag]+=1
            else:
                tag = tags.strip().replace("(right)","").replace("(left)","").replace("(left,right)","")
                if tag in tags_count.keys():                                
                    tags_count[tag]+=1
        except ValueError as ex:
            logging.error("Error in 'read_hardrulestags': Missing parts")
        except KeyError as ex:        
            continue  

     
    tags_count["pii"] = int(src_pii)+int(trg_pii)
    
    stats["hardrules_tags"] = json.dumps(tags_count)
        
    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)