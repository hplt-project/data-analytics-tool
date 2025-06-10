import argparse
import json
from bicleanerscorer import read_hardrulestags

parser = argparse.ArgumentParser()
parser.add_argument('hardrules', type=argparse.FileType('rb'), help="Hardrules file.")
parser.add_argument('srclang', type=str, help="Source language")
args = parser.parse_args()


monocleaner_tags = read_hardrulestags(args.hardrules.name, "",  args.srclang)
print(json.dumps(monocleaner_tags))
