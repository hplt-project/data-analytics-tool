import sys
from fastspell import FastSpell

lang = sys.argv[1]

#this should trigger downloads
fs = FastSpell(lang, mode="aggr")
