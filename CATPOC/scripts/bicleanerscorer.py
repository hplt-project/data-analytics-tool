import os
import logging
import yaml

tag_types = [
    #"no_empty",                    # Sentence is empty (already in histogram)
    "not_too_long",                # Sentence is more than 1024 characters long
    "not_too_short",               # Sentence is less than 3 words long
    #"length_ratio",                # The length ratio between the source sentence and target sentence (in bytes) is too low or too high (already in OpusFilter)
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

def remove_porntag(srclang, trglang):
    # Check if there is porn file, otherwise remove it:
    datapath = os.environ["datapath"]
    #very nasty fix...
    #Check if exists in bicleaner classic...
    yaml_file_path = datapath + "/bicleaner/"+srclang+"-"+trglang+"/"+srclang+"-"+trglang+".yaml"
    if not os.path.exists(yaml_file_path):
        yaml_file_path = datapath + "/bicleaner-ai/"+srclang+"-"+trglang+"/metadata.yaml"
    if not os.path.exists(yaml_file_path):
        yaml_file_path = datapath + "/bicleaner-ai/"+srclang+"-"+"xx"+"/metadata.yaml"
    if not os.path.exists(yaml_file_path):
        #No bicleaner
        tag_types.remove("no_porn")
        return tag_types

        
    # Open the YAML file
    with open(yaml_file_path, "r") as yaml_file:
        # Load the YAML content
        yaml_data = yaml.safe_load(yaml_file)

        # Check if "porn_removal_file" key exists
        if "porn_removal_file" not in yaml_data:
            tag_types.remove("no_porn")
    return tag_types

def read_bicleanertags(corpusname,srclang, trglang):
    bicleaneroutput = corpusname+".bicleaner-hardrules"
    if not os.path.exists(bicleaneroutput):
        return {}
    srcs = []
    tgts = []
    keeps = []
    tagss = []
    for line in open(bicleaneroutput, "r"):
        try:
            src, tgt, keep, tags = line.split("\t")
            srcs.append(src)
            tgts.append(tgt)
            keeps.append(keep)
            tagss.append(tags)
            
        except ValueError as ex:
            logging.error("Error in 'read_bicleanertags': Missing parts")
            logging.error(ex)
            logging.error(line)
            srcs.append("")
            tgts.append("")
            keeps.append("0")
            tagss.append("wrong_cols")
    
    # tags (we can modify tag selection above)
    clean_tags = []
    for tag in tagss:
        if "+" in tag:
            moretags = list(set(tag.split("+"))) # when there is more than one tag in the same sentence, just count the different type of tags
            for tag in moretags:
                tag = tag.replace("(right)","").replace("(left)","").replace("(left,right)","")
                clean_tags.extend([tag])
        else:
            tag = tag.replace("(right)","").replace("(left)","").replace("(left,right)","")
            clean_tags.extend([tag])
    
    tag_types = remove_porntag(srclang, trglang)

    tags_percent = {}
    for tag in tag_types:
        count = clean_tags.count(tag)
        percentage = round(count*100/(len(srcs)),2)
        tags_percent[tag]=percentage
    return(tags_percent)

def read_bicleanerscores(corpusname):
    bicleanerscores = corpusname+".bicleaner-classify"
    if not os.path.exists(bicleanerscores):
        return {}

    buckets = [[] for _ in range(10)]        

    for line in open(bicleanerscores, "r"):
        score = line.strip()
        try:
            bucket_index = int(float(score) * 10)
            buckets[bucket_index].append(score)
        except IndexError as ex:
            if bucket_index == 10:
                buckets[9].append(score) #score was 1.000, add to last bucket
            else:
                logging.error(ex)
                

    bucket_counts = [[i / 10, len(bucket)] for i, bucket in enumerate(buckets)]

    return(bucket_counts)


#tags = read_bicleanertags("uploaded_corpora/xx","en","ca")
#scores = read_bicleanerscores("uploaded_corpora/edu")
