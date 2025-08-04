import os
import logging
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

def remove_porntag(yamlfile):
    # Check if there is porn file, otherwise remove it:

    if not os.path.exists(yamlfile):
        tag_types.remove("no_porn")
        return tag_types
            
     # Load the YAML content
    with open(yamlfile, 'r') as yf:
        yaml_data = yaml.safe_load(yf)
        
        # Check if "porn_removal_file" key exists
        if "porn_removal_file" not in yaml_data:
            tag_types.remove("no_porn")
    return tag_types

def read_hardrulestags(corpusname, yamlfile, srclang, trglang=None):

    hardrules_output = corpusname+".hardrules"

    if not os.path.exists(hardrules_output):
        hardrules_output = corpusname+"."+srclang+".hardrules"
        if not os.path.exists(hardrules_output):
            logging.warning("Hardrules file not found")
            return {}

    logging.debug("Reading hardrules from " +  hardrules_output)
    print ("Reading hardrules from " +  hardrules_output)

    lines = 0

    tag_types = remove_porntag(yamlfile)
    if trglang==None:
        tag_types.remove("length_ratio")

    tags_count = {}

    for t in tag_types:
        tags_count[t]=0

    '''
    for tag in tag_types:
        count = clean_tags.count(tag)
        if lines > 0:
            percentage = round(count*100/(lines),2)     
        else:
            percentage = 0
        tags_percent[tag]=percentage
    '''

    for line in open(hardrules_output, "r"):
        lines =  lines+1
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

            #tagss.append(tags)
            
        except ValueError as ex:
            logging.error("Error in 'read_hardrulestags': Missing parts")
            logging.error(ex)
            logging.error(line)
            #keeps.append("0")
            #tagss.append("wrong_cols")
            continue
        except KeyError as ex:        
            continue            

    return(tags_count)


def read_scores(corpusname):
    scoresfile = corpusname+".classify"
    if not os.path.exists(scoresfile):
        return {}

    buckets = [0 for _ in range(10)]        
    

    for line in open(scoresfile, "r"):
        score = line.strip()
        try:
            bucket_index = int(float(score) * 10)
            buckets[bucket_index]+=1
        except IndexError as ex:
            if bucket_index == 10:
                buckets[9]+=1 #score was 1.000, add to last bucket
            else:
                logging.error(ex)
                

    bucket_counts = [[i / 10, bucket] for i, bucket in enumerate(buckets)]

    return(bucket_counts)
