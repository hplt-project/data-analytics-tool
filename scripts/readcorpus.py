import io
import os
import re
import sys
import logging
import traceback
import argparse
import json

from iso639 import Lang

from pii_manager import PiiEnum
from pii_manager.api import PiiManager
from pii_manager.lang import COUNTRY_ANY

from util import logging_setup
from xxhash import xxh64
from ngrams import get_line_ngrams, get_stopwords
from tokenizer  import CustomTokenizer

def initialization():
    #parser = argparse.ArgumentParser()    
    #parser.add_argument('corpus', type=argparse.FileType('rt'), help="Corpus name. Prefix to the source and target bitexts.")
    #parser.add_argument('statsfile', type=str, help="Output YAML stats file.") #TODO: default tmpfile #type=argparse.FileType('w'),    
    
    parser = argparse.ArgumentParser(prog=os.path.basename(sys.argv[0]), formatter_class=argparse.ArgumentDefaultsHelpFormatter, description=__doc__)
    parser.add_argument('input',  nargs='?', type=argparse.FileType('rt', errors="replace"), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input TSV file.")
    parser.add_argument('srclang', type=str, help="Source language")
    parser.add_argument('trglang', type=str, help="Target language")
    parser.add_argument('output', nargs='?', type=argparse.FileType('wt'), default=sys.stdout, help="Output.")
    
    # Logging group
    groupL = parser.add_argument_group('Logging')
    groupL.add_argument('-q', '--quiet', action='store_true', help='Silent logging mode')
    groupL.add_argument('--debug', action='store_true', help='Debug logging mode')
    groupL.add_argument('--logfile', type=argparse.FileType('a'), default=sys.stderr, help="Store log to a file")
    #groupL.add_argument('-v', '--version', action='version', version="%(prog)s " + __version__, help="show version of this script and exit")

    args = parser.parse_args()
    logging_setup(args)
    return args

def get_pii_proc(lang):
    pii_isolang = Lang(lang.split('_')[0])

    if pii_isolang.pt3 == 'hbs':
        pii_lang = 'hbs'
    elif not pii_isolang.pt1:
        pii_lang = 'any'
    else:
        pii_lang = pii_isolang.pt1

    pii_country = COUNTRY_ANY
    pii_tasklist = (PiiEnum.IP_ADDRESS, PiiEnum.EMAIL_ADDRESS, PiiEnum.PHONE_NUMBER)
    pii_proc = PiiManager(pii_lang, pii_country, tasks=pii_tasklist, mode="extract")
    return pii_proc

def print_in_column(col, array_items, output):

    for item in array_items:
        for i in range(col-1):        
            output.write("\t")
            
        output.write(item+"\n")
    
def main():
    args = initialization() # Parsing parameters
    #logging_setup(args)
    logging.info("Starting process")
      
    src_tokenizer = CustomTokenizer(args.srclang)
    trg_tokenizer = CustomTokenizer(args.trglang)

    logging.info("Tokenizing " + args.srclang + " with " +src_tokenizer.toktype + " (" + str(src_tokenizer.getWarnings()) +")") 
    logging.info("Tokenizing " + args.trglang + " with " +trg_tokenizer.toktype + " (" + str(src_tokenizer.getWarnings()) +")") 
    
    #PII
    src_pii_proc = get_pii_proc(args.srclang)
    trg_pii_proc = get_pii_proc(args.trglang)
    
    warnings = []
    

#    for w in src_tokenizer.getWarnings():
#        warnings.append("src_"+w)
#    for w in trg_tokenizer.getWarnings():
#        warnings.append("trg_"+w)
        
        


           
    #src_ngrams_warnings = set()    
    #trg_ngrams_warnings = set()
    
    src_stopwords, nwarnings = get_stopwords(args.srclang)
    #for w in nwarnings:
    #    src_ngrams_warnings.add("src_"+w)
    trg_stopwords, nwarnings = get_stopwords(args.trglang)
    #for w in nwarnings:
    #    trg_ngrams_warnings.add("trg_"+w)
    
    #Output format:
    # srctokcount trgtokcount srcbytes trgbytes  srcchars trgchars srcpii trgpii srchash trghash pairhash
    # src_onegrams src_twograms src_threegrams src_fourgrams src_fivegrams
    # trg_onegrams trg_twograms trg_threegrams trg_fourgrams trg_fivegrams    
    for line in args.input:
        lineparts = line.split("\t")
        src = lineparts[0].strip()
        trg = lineparts[1].strip()
        srctoks = []
        trgtoks = []
        srctokcount =  0
        trgtokcount = 0
        srcbytes = 0
        trgbytes = 0
        srcchars = 0
        trgchars = 0
        srcpii = 0
        trgpii = 0
        srchash = ""
        trghash = ""
        pairhash = ""
        src_onegrams = []
        src_twograms = []
        src_threegrams = []
        src_fourgrams =  []
        src_fivegrams = []
        trg_onegrams = []
        trg_twograms = []
        trg_threegrams = []
        trg_fourgrams =  []
        trg_fivegrams = []
        
        #PII
        src_pii_matches = src_pii_proc(src)
        try:
            next(src_pii_matches)
            srcpii = 1
        except StopIteration:
            pass
            
        trg_pii_matches = trg_pii_proc(trg)
        try:
            next(trg_pii_matches)
            trgpii = 1
        except StopIteration:
            pass
  
        #Counting tokens in each sentence
        srctoks = src_tokenizer.tokenize(src)
        trgtoks = trg_tokenizer.tokenize(trg)

        srctokcount = len(srctoks)
        trgtokcount = len(trgtoks)
        
        #Get hashes in each sentence 
        srchash = xxh64(src).hexdigest()
        trghash = xxh64(trg).hexdigest()
        pairhash = xxh64(src + "\t" + trg).hexdigest()


        # Corpus strings
        srcbytes = len(src.encode('utf-8'))
        trgbytes = len(trg.encode('utf-8'))
        
        srcchars = len(src)
        trgchars = len(trg)

        
        
        #ngrams
        
        src_ngrams_dict, nwarning = get_line_ngrams(args.srclang, srctoks, 5, src_stopwords)        
        trg_ngrams_dict, nwarning = get_line_ngrams(args.trglang, trgtoks, 5, trg_stopwords)        

        for g in src_ngrams_dict.get(1):
            src_onegrams.append(" ".join(g))
        for g in src_ngrams_dict.get(2):
            src_twograms.append(" ".join(g))
        for g in src_ngrams_dict.get(3):
            src_threegrams.append(" ".join(g))
        for g in src_ngrams_dict.get(4): 
            src_fourgrams.append(" ".join(g))
        for g in src_ngrams_dict.get(5):
            src_fivegrams.append(" ".join(g))
        
        for g in trg_ngrams_dict.get(1):
            trg_onegrams.append(" ".join(g))
        for g in trg_ngrams_dict.get(2):
            trg_twograms.append(" ".join(g))
        for g in trg_ngrams_dict.get(3):
            trg_threegrams.append(" ".join(g))
        for g in trg_ngrams_dict.get(4): 
            trg_fourgrams.append(" ".join(g))
        for g in trg_ngrams_dict.get(5):
            trg_fivegrams.append(" ".join(g))

        #args.output.write("\t".join([src, trg, " ".join(srctoks), " ".join(trgtoks), str(srctokcount), str(trgtokcount), str(srcbytes), str(trgbytes), str(srcchars), str(trgchars), str(srcpii), str(trgpii), srchash, trghash, pairhash ])+"\n")
        args.output.write("\t".join([str(srctokcount), str(trgtokcount), \
                        str(srcbytes), str(trgbytes), \
                        str(srcchars), str(trgchars), \
                        str(srcpii), str(trgpii), \
                        srchash, trghash, pairhash])+"\n")

        #now, this is the ugliest thing ever, but it's for the sake of the final output format... trust the process
        print_in_column(12, src_onegrams, args.output)
        print_in_column(13, src_twograms, args.output)
        print_in_column(14, src_threegrams, args.output)
        print_in_column(15, src_fourgrams, args.output)
        print_in_column(16, src_fivegrams, args.output)
        print_in_column(17, trg_onegrams, args.output)
        print_in_column(18, trg_twograms, args.output)
        print_in_column(19, trg_threegrams, args.output)
        print_in_column(20, trg_fourgrams, args.output)
        print_in_column(21, trg_fivegrams, args.output)
        
        '''    
        json.dumps(src_twograms), json.dumps(src_threegrams), json.dumps(src_fourgrams), json.dumps(src_fivegrams), \
                        json.dumps(trg_onegrams), json.dumps(trg_twograms), json.dumps(trg_threegrams), json.dumps(trg_fourgrams), json.dumps(trg_fivegrams) ])+"\n")
        
        '''
        
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)
