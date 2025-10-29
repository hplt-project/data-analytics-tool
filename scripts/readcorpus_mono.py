import io
import os
import sys
import logging
import traceback
import argparse
import yaml
import json
from iso639 import Lang

from pii_manager import PiiEnum
from pii_manager.api import PiiManager
from pii_manager.lang import COUNTRY_ANY

from util import logging_setup, stdout_to_err, print_in_column
from ngrams import get_line_ngrams, get_stopwords
from xxhash import xxh64
from tokenizer import CustomTokenizer

def initialization():
    parser = argparse.ArgumentParser()
    
    parser.add_argument('srclang', type=str, help="Source language")
    parser.add_argument('srclang2', type=str, help="Source language 2-letter code")
    parser.add_argument('input',  nargs='?', type=argparse.FileType('rt', errors="replace"), default=io.TextIOWrapper(sys.stdin.buffer, errors="replace"),  help="Input TSV file.")
    parser.add_argument('output', nargs='?', type=argparse.FileType('wt'), default=sys.stdout, help="Output.")
    
    # Logging group    
    groupL = parser.add_argument_group('Logging')
    groupL.add_argument('-q', '--quiet', action='store_true', help='Silent logging mode')
    groupL.add_argument('--debug', action='store_true', help='Debug logging mode')
    groupL.add_argument('--logfile', type=argparse.FileType('a'), default=sys.stderr, help="Store log to a file")

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
    with stdout_to_err():
        pii_proc = PiiManager(pii_lang, pii_country, tasks=pii_tasklist, mode="extract")
            
    return pii_proc
    
def main():
    args = initialization() # Parsing parameters
    logging.info("Starting process")

    src_tokenizer = CustomTokenizer(args.srclang2)    
    logging.info("Tokenizing " + args.srclang + " with " +src_tokenizer.toktype + " (" + str(src_tokenizer.getWarnings()) +")" )

    src_stopwords, nwarnings = get_stopwords(args.srclang2)
    logging.debug("Starting reading corpus")
    
    src_pii_proc = get_pii_proc(args.srclang)
    
    for line in args.input:
        src = line.strip()
        srctoks = []
        srctokcount = 0
        srcbytes = 0
        srcchars = 0
        srcpii = 0
        srchash = ""
        src_onegrams = []
        src_twograms = []
        src_threegrams = []
        src_fourgrams =  []
        src_fivegrams = []
        
        #Volumes
        srctoks = src_tokenizer.tokenize(src)
        srctokcount = len(srctoks)
        srchash = xxh64(src).hexdigest()
        srcbytes = len(src.encode('utf-8'))            
        srcchars = len(src)

        #PII
        src_pii_matches = src_pii_proc(src)
        try:
            next(src_pii_matches)
            srcpii = 1
        except StopIteration:
            pass

        #ngrams
        src_ngrams_dict, nwarning = get_line_ngrams(args.srclang2, srctoks, 5, src_stopwords)
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
        
        #Write outoput:
        #srctokcount srcbytes srcchars srcpii srchash
        args.output.write("\t".join([str(srctokcount), str(srcbytes), str(srcchars), str(srcpii), srchash])+"\n")        
        #now, this is the ugliest thing ever, but it's for the sake of the final output format... trust the process
        print_in_column(6, src_onegrams, args.output)
        print_in_column(7, src_twograms, args.output)
        print_in_column(8, src_threegrams, args.output)
        print_in_column(9, src_fourgrams, args.output)
        print_in_column(10, src_fivegrams, args.output)

    
        
if __name__ == '__main__':
    try:
        main()  # Running main program
    except Exception as ex:
        tb = traceback.format_exc()
        logging.error(tb)
        sys.exit(1)
