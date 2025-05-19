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
    assert len(volumes) == 10, "Missing parts in the volumes file"
    #Fields:
    # 0: sentencepairs  1: srctokcount 2: trgtokcount 3:srcbytes 4:trgbytes 5:srcchars 6:trgchars 7:srcpii 8:trgpii
    stats["sentence_pairs"] = int(volumes[0])
    stats["src_tokens"] = int(volumes[1])
    stats["trg_tokens"] = int(volumes[2])
    stats["src_bytes"] = int(volumes[3])
    stats["trg_bytes"] = int(volumes[4])
    stats["src_chars"] = int(volumes[5])
    stats["trg_chars"] = int(volumes[6])
    stats["src_pii"] = int(volumes[7])
    stats["trg_pii"] = int(volumes[8])
    stats["unique_sents"] = int(volumes[9])-1  #Removing one because of empty fields in the proc file due to ngrams
    yaml.dump(stats, args.yamlfile)
            
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)