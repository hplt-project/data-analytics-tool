from collections import Counter

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

def read_bicleanertags(corpusname):
    bicleaneroutput = corpusname+".bicleaner-hardrules"
    src, tgt, keep, tags = zip(*(line.split("\t") for line in open(bicleaneroutput, "r").read().splitlines()))
    
    # tags (we can modify tag selection above)
    clean_tags = []
    for tag in tags:
        if "+" in tag:
            moretags = list(set(tag.split("+"))) # when there is more than one tag in the same sentence, just count the different type of tags
            for tag in moretags:
                tag = tag.replace("(right)","").replace("(left)","").replace("(left,right)","")
                clean_tags.extend([tag])
        else:
            tag = tag.replace("(right)","").replace("(left)","").replace("(left,right)","")
            clean_tags.extend([tag])

    tags_percent = {}
    for tag in tag_types:
        count = clean_tags.count(tag)
        percentage = round(count*100/(len(src)),2)
        tags_percent[tag]=percentage
    return(tags_percent)

def read_bicleanerscores(corpusname):
    bicleanerscores = corpusname+".bicleaner-classify"
    src, tgt, scores = zip(*(line.split("\t") for line in open(bicleanerscores, "r").read().splitlines()))

    buckets = [[] for _ in range(10)]
    print(buckets)
    for item in scores:
        bucket_index = int(float(item) * 10)
        buckets[bucket_index].append(item)

    bucket_counts = [[i / 10, len(bucket)] for i, bucket in enumerate(buckets)]

    return(bucket_counts)


#tags = read_bicleanertags("uploaded_corpora/edu")
#scores = read_bicleanerscores("uploaded_corpora/edu")
