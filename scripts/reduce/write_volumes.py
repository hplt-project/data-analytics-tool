import sys
import argparse
import traceback
import logging
import yaml

def initialization():
    parser = argparse.ArgumentParser()
    parser.add_argument('volumesfile', type=argparse.FileType('r'), help="Input volumes file")
    parser.add_argument('yamlfile', type=argparse.FileType('a'), help="Output YAML stats file.") 
    
    args = parser.parse_args()
    return args
    
def main():    
    args = initialization()
    stats = {}
    volumes_line = args.volumesfile.readline()
    volumes = volumes_line.strip().split("\t")
    assert (len(volumes) == 10 or len(volumes) == 6), "Missing parts in the volumes file"
    #Fields:
    if len(volumes) == 10:
        #is parallel
        # 0:sentencepairs  1:srctokcount 2:trgtokcount 3:srcbytes 4:trgbytes 5:srcchars 6:trgchars 7:srcpii 8:trgpii 9:uniquesents
        stats["sentence_pairs"] = int(volumes[0])
        stats["src_tokens"] = int(volumes[1])
        stats["trg_tokens"] = int(volumes[2])
        stats["src_bytes"] = int(volumes[3])
        stats["trg_bytes"] = int(volumes[4])
        stats["src_chars"] = int(volumes[5])
        stats["trg_chars"] = int(volumes[6])
        stats["src_pii"] = int(volumes[7])
        stats["trg_pii"] = int(volumes[8])
        stats["unique_sents"] = int(volumes[9]) - 1  # Removing one because of empty fields in the proc file due to ngrams
        duplicates = stats["sentence_pairs"] - stats["unique_sents"]
        stats["duplication_ratio"] = round(duplicates / stats["sentence_pairs"], 4)
    if len(volumes) == 6: 
        #is mono
        #0: sentences 1:srctokcount 2:srcbytes 3:srcchars 4:srcpii 5:uniquesents
        stats["sentence_pairs"] = int(volumes[0])
        stats["src_tokens"] = int(volumes[1])
        stats["src_bytes"] = int(volumes[2])
        stats["src_chars"] = int(volumes[3])
        stats["src_pii"] = int(volumes[4])
        stats["unique_sents"] = int(volumes[5]) - 1
        duplicates = stats["sentence_pairs"] - stats["unique_sents"]
        stats["duplication_ratio"] = round(duplicates / stats["sentence_pairs"], 4)
    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)