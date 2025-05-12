import io
import os
import re
import sys
import logging
import traceback
import argparse
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
    parser.add_argument('source',  nargs='?', type=argparse.FileType('rt', errors="replace"), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input source sentences.")
    parser.add_argument('target',  nargs='?', type=argparse.FileType('rt', errors="replace"), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input target sentences.")    
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

def main():
    args = initialization() # Parsing parameters
    logging_setup(args)
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
        
        
    #ngrams files
    #src_onegrams_file = open(args.corpus.name + "." + args.srclang + ".one", "w")
    #src_twograms_file = open(args.corpus.name +  "." + args.srclang + ".two", "w")
    #src_threegrams_file = open(args.corpus.name + "." + args.srclang +  ".three", "w")
    #src_fourgrams_file = open(args.corpus.name + "." + args.srclang + ".four", "w")
    #src_fivegrams_file = open(args.corpus.name + "." + args.srclang +".five", "w")        

    #trg_onegrams_file = open(args.corpus.name + "." + args.trglang + ".one", "w")
    #trg_twograms_file = open(args.corpus.name +  "." + args.trglang + ".two", "w")
    #trg_threegrams_file = open(args.corpus.name + "." + args.trglang +  ".three", "w")
    #trg_fourgrams_file = open(args.corpus.name + "." + args.trglang + ".four", "w")
    #trg_fivegrams_file = open(args.corpus.name + "." + args.trglang +".five", "w")

    #src_onegrams_buffer = []
    #src_twograms_buffer = []
    #src_threegrams_buffer = []
    #src_fourgrams_buffer =  []
    #src_fivegrams_buffer = []
    
    #trg_onegrams_buffer = []
    #trg_twograms_buffer = []
    #trg_threegrams_buffer = []
    #trg_fourgrams_buffer =  []
    #trg_fivegrams_buffer = []

    #src_onegrams_counter = 0
    #src_twograms_counter = 0
    #src_threegrams_counter = 0
    #src_fourgrams_counter = 0
    #src_fivegrams_counter = 0
    
    #trg_onegrams_counter = 0
    #trg_twograms_counter = 0
    #trg_threegrams_counter = 0
    #trg_fourgrams_counter = 0
    #trg_fivegrams_counter = 0
       
    #src_ngrams_warnings = set()    
    #trg_ngrams_warnings = set()
    
    #src_stopwords, nwarnings = get_stopwords(args.srclang)
    #for w in nwarnings:
    #    src_ngrams_warnings.add("src_"+w)
    #trg_stopwords, nwarnings = get_stopwords(args.trglang)
    #for w in nwarnings:
    #    trg_ngrams_warnings.add("trg_"+w)
    
    #Output format:
    #src trg srctoks trgtoks srctokcount trgtokcount srcbytes trgbytes  srcchars trgchars srcpii trgpii srchash trghash pairhash 
    for src_line, trg_line in zip(args.source, args.target):
        src = src_line.strip()
        trg = trg_line.strip()
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
        
        src_ngrams_dict, nwarning = get_line_ngrams(args.srclang, tokenized_src, 5, src_stopwords)        
        trg_ngrams_dict, nwarning = get_line_ngrams(args.trglang, tokenized_trg, 5, trg_stopwords)        

        for g in src_ngrams_dict.get(1):
            src_onegrams_buffer.append(" ".join(g))
        for g in src_ngrams_dict.get(2):
            src_twograms_buffer.append(" ".join(g))
        for g in src_ngrams_dict.get(3):
            src_threegrams_buffer.append(" ".join(g))
        for g in src_ngrams_dict.get(4): 
            src_fourgrams_buffer.append(" ".join(g))
        for g in src_ngrams_dict.get(5):
            src_fivegrams_buffer.append(" ".join(g))
        
        for g in trg_ngrams_dict.get(1):
            trg_onegrams_buffer.append(" ".join(g))
        for g in trg_ngrams_dict.get(2):
            trg_twograms_buffer.append(" ".join(g))
        for g in trg_ngrams_dict.get(3):
            trg_threegrams_buffer.append(" ".join(g))
        slickfor g in trg_ngrams_dict.get(4): 
            trg_fourgrams_buffer.append(" ".join(g))
        for g in trg_ngrams_dict.get(5):
            trg_fivegrams_buffer.append(" ".join(g))

        args.output.write("\t".join([src, trg, " ".join(srctoks), " ".join(trgtoks), str(srctokcount), str(trgtokcount), str(srcbytes), str(trgbytes), str(srcchars), str(trgchars), str(srcpii), str(trgpii), srchash, trghash, pairhash ])+"\n")
        

        #Write buffers to files:
        '''
        if src_onegrams_counter > 10000000:
            for g in src_onegrams_buffer:
                src_onegrams_file.write(g+"\n")
            src_onegrams_buffer = []
        if src_twograms_counter > 10000000:
            for g in src_twograms_buffer:
                src_twograms_file.write(g+"\n")
            src_twograms_buffer = []
        if src_threegrams_counter > 10000000:
            for g in src_threegrams_buffer:
                src_threegrams_file.write(g+"\n")
            src_threegrams_buffer = []
        if src_fourgrams_counter > 1000000:
            for g in src_fourgrams_buffer:
                src_fourgrams_file.write(g+"\n")
            src_fourgrams_buffer = []
        if src_fivegrams_counter > 1000000:
            for g in src_fivegrams_buffer:
                src_fivegrams_file.write(g+"\n")
            src_fivegrams_buffer = []
                
        if trg_onegrams_counter > 10000000:
            for g in trg_onegrams_buffer:
                trg_onegrams_file.write(g+"\n")
            trg_onegrams_buffer = []
            trg_onegrams_counter = 0
        if trg_twograms_counter > 10000000:
            for g in trg_twograms_buffer:
                trg_twograms_file.write(g+"\n")
            trg_twograms_buffer = []
            trg_twograms_counter = 0
        if trg_threegrams_counter > 10000000:
            for g in trg_threegrams_buffer:
                trg_threegrams_file.write(g+"\n")
            trg_threegrams_buffer = []
            trg_threegrams_counter = 0
        if trg_fourgrams_counter > 1000000:
            for g in trg_fourgrams_buffer:
                trg_fourgrams_file.write(g+"\n")
            trg_fourgrams_buffer = []
            trg_fourgrams_counter = 0
        if trg_fivegrams_counter > 1000000:
            for g in trg_fivegrams_buffer:
                trg_fivegrams_file.write(g+"\n")
            trg_fivegrams_buffer = []
            trg_fivegrams_counter = 0        
        '''         
        
    
    
    #Write remaining ngrams in buffers
    '''
    for g in src_onegrams_buffer:
        src_onegrams_file.write(g+"\n")
    for g in src_twograms_buffer:
        src_twograms_file.write(g+"\n")
    for g in src_threegrams_buffer:
        src_threegrams_file.write(g+"\n")
    for g in src_fourgrams_buffer:
        src_fourgrams_file.write(g+"\n")
    for g in src_fivegrams_buffer:
        src_fivegrams_file.write(g+"\n")
    for g in trg_onegrams_buffer:
        trg_onegrams_file.write(g+"\n")
    for g in trg_twograms_buffer:
        trg_twograms_file.write(g+"\n")
    for g in trg_threegrams_buffer:
        trg_threegrams_file.write(g+"\n")
    for g in trg_fourgrams_buffer:
        trg_fourgrams_file.write(g+"\n")
    for g in trg_fivegrams_buffer:
        trg_fivegrams_file.write(g+"\n")
    '''
    
        
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)
