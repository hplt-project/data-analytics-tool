import logging

import mecab_ko
import MeCab
import reldi_tokeniser
import pyidaungsu
import spacy_pkuseg as pkuseg
import hebrew_tokenizer
import botok

from sacremoses import MosesTokenizer
from nltk.tokenize import WordPunctTokenizer, word_tokenize
from sinling import SinhalaTokenizer
from fitrat import word_tokenize as fitrat_word_tokenize
from thai_segmenter import tokenize as thai_tokenize
from indicnlp.tokenize import indic_tokenize
from nlp_id.tokenizer import Tokenizer as IndonesianTokenizer
from klpt.tokenize import Tokenize as KurdishTokenizer
from pycantonese.word_segmentation import segment as cantonese_segment
from laonlp.tokenize import word_tokenize as lao_tokenize
from openodia import ud as openodia_tokenize
from igbo_text import IgboText

try:
    from bnlp import NLTKTokenizer
except:
    pass


#Apparently mahaNLP overwrites the logging level to quiet-er than desired
logging.disable(logging.NOTSET)

MOSES_LANGS = ["as", "ba", "br", "ca", "cs", "co", "de", "el", "en", "es", "fi", "fr", "ga", "hu", "is", "it", "lt", "lv", "mni", "nl", "pl", "pt", "ro", "ru", "sk", "sl", "sv", "ta"]

NLTK_WORD_LANGS = ["ar", "ayr", "az", "ban", "be", "bjn", "bm", "bem", "ceb", "crh", "dik","dyu", "dz", "fa", "fo", "fuv", "gaz", "gd", "ha", "ht", "hy","ilo", "jv",
                    "ka", "kab", "kac", "kam", "kbp", "kea", "kg", "ki", "kk", "kmb", "knc", "ky", "li", "lij", "lmo",  "ltg", "luo",  "lus", "mi", "min", "mn", 
                    "ms", "nso", "ny", "oc", "pag", "pap", "plt", "ps","quy", "rn", "rw", "sc", "scn", "sd", "sg", "sm", "ss", "su",
                    "tg", "ti", "tk", "tn", "tpi", "ts", "tt", "tw", "tzm", "tum", "uk", "ug", "umb", "vec", "vi", "war", "wo", "xh", "yo", "zu"]
NLTK_PUNKT_LANGS = {"no": "norwegian",
                    "et": "estonian",
                    "da": "danish",
                    "tr": "turkish",
                    "ml": "malayalam"}

RELDI_LANGS  = ["sr", "mk", "bg", "hr"]
RELDI_FALLBACK = {"bs": "sr"}

MOSES_FALLBACK = {
                 "ab": "ru",
                 "af": "nl",
                 "ast": "es",
                 "ba": "ru",
                 "br": "fr",
                 "co": "it",
                 "cy": "en",
                 "eo": "en",
                 "eu": "es",
                 "gl": "es",
                 "la": "en",
                 "lb": "de",
                 "mt": "en",
                 "so": "en",
                 "sq": "en",
                 "sw": "en",
                 "tl": "en"}

NLTK_FALLBACK = {"nb": "no",
                "nn": "no"}

MECAB_JA = ["ja"]

MECAB_KO = ["ko"]

PDS_LANGS = ["my", "shn"]

SINLING_LANGS = ["si"]

FITRAT_LANGS = ["uz"]

BNLP_LANGS = ["bn"]

THAI_LANGS = ["th"]

INDIC_LANGS = ["awa", "gu" ,"hi", "hne", "kn", "mag", "mai", "mr", "ne", "pa", "sa", "te", "ur"]

PKUSEG_LANGS = ["zh", "zh-Hant"]

HEBREW_LANGS = ["he", "iw", "ydd"]

NLPID_LANGS =  ["id"]

BOTOK_LANGS = ["bo"]

KLPT_LANGS = ["ckb", "kmr"]

CANTONESE_LANGS = ["yue"]

LAONLP_LANGS = ["lo"]

OPENODIA_LANGS = ["ory"]

IGBO_LANGS = ["ig"]

class CustomTokenizer:


    def  __init__(self, lang):
        self.lang = None
        self.tokenizer = None
        self.toktype = None
        self.warnings = []
        
        self.lang = lang
        self.setTokenizer(lang)
    

    def setTokenizer(self, lang):
        if lang in MOSES_LANGS:
            self.tokenizer =  MosesTokenizer(lang).tokenize
            self.toktype = "moses"
        elif lang in MOSES_FALLBACK.keys():
            moses_lang = MOSES_FALLBACK.get(lang)
            self.tokenizer = MosesTokenizer(moses_lang).tokenize
            self.toktype =  "moses"
            self.warnings.append("warning_tok_moses_"+moses_lang)

        elif lang in NLTK_WORD_LANGS:
            self.tokenizer = WordPunctTokenizer()
            self.toktype = "nltk_wordpunct"
            self.warnings.append("warning_tok_nltk_wordpunct")
        elif lang in NLTK_PUNKT_LANGS.keys():
            self.tokenizer = word_tokenize
            self.toktype = "nltk_punkt_" + NLTK_PUNKT_LANGS.get(lang)
        elif lang in NLTK_FALLBACK.keys():
            nltk_langcode = NLTK_FALLBACK.get(lang)
            nltk_langname = NLTK_PUNKT_LANGS.get(nltk_langcode)
            self.tokenizer = word_tokenize
            self.toktype = "nltk_punkt_" + nltk_langname
            self.warnings.append("warning_tok_nltk_punkt_"+nltk_langcode)           

        elif lang in MECAB_JA:
            self.tokenizer = MeCab.Tagger("-Owakati")
            self.toktype = "mecab"

        elif lang in MECAB_KO:
            self.tokenizer = mecab_ko.Tagger("-Owakati")
            self.toktype = "mecab"            

#        elif lang in NLPASHTO_LANGS:
#            self.tokenizer = word_segment(sent)
#            self.toktype = "nlpashto"
        
        elif lang in RELDI_LANGS:
            self.tokenizer = reldi_tokeniser
            self.toktype = "reldi_" + lang        
        elif lang in RELDI_FALLBACK.keys():
            self.tokenizer = reldi_tokeniser
            reldilang = RELDI_FALLBACK.get(lang)
            self.toktype = "reldi_" + reldilang 
            self.warnings.append("warning_tok_reldi_"+reldilang)          
        
        elif lang in PDS_LANGS:
            self.tokenizer = pyidaungsu.tokenize
            self.toktype = "pds"
            
        elif lang in SINLING_LANGS:
            self.tokenizer = SinhalaTokenizer()
            self.toktype = "sinling"

        elif lang in FITRAT_LANGS:
            self.tokenizer = fitrat_word_tokenize
            self.toktype = "fitrat"        
            
        elif lang in BNLP_LANGS:
            self.tokenizer = NLTKTokenizer()
            self.toktype = "bnlp"

        elif lang in THAI_LANGS:
            self.tokenizer = thai_tokenize
            self.toktype = "thai"

        elif lang in INDIC_LANGS:
            self.tokenizer = indic_tokenize
            self.toktype = "indic_" + lang
           
        elif lang in PKUSEG_LANGS:           
            self.tokenizer = pkuseg.pkuseg()
            self.toktype = "pkuseg"        
                
        elif lang in HEBREW_LANGS:
            self.tokenizer = hebrew_tokenizer
            self.toktype = "hebrew"
            
        elif lang in NLPID_LANGS:
            self.tokenizer = IndonesianTokenizer()
            self.toktype = "nlpid"

        elif lang in BOTOK_LANGS:  #This is a little bit slow...
            config=botok.config.Config(dialect_name="general")
            self.tokenizer = botok.WordTokenizer(config)                          
            self.toktype = "botok"

        elif lang in KLPT_LANGS:
            if lang == "kmr":
                self.tokenizer=KurdishTokenizer("Kurmanji", "Latin")
            elif lang =="ckb":
                self.tokenizer=KurdishTokenizer("Sorani", "Arabic")
            self.toktype = "klpt"
        
        elif lang in CANTONESE_LANGS:
            self.tokenizer  = cantonese_segment
            self.toktype = "pycantonese"
        
        elif lang in LAONLP_LANGS:
            self.tokenizer = lao_tokenize
            self.toktype = "laonlp"
            
        elif lang in OPENODIA_LANGS:
            self.tokenizer = openodia_tokenize.word_tokenizer
            self.toktype = "openodia"
            
        elif lang in IGBO_LANGS:
            self.tokenizer = IgboText()
            self.toktype = "igbo"
            
        else:
            '''
            self.tokenizer =  MosesTokenizer("en")
            self.toktype = "moses"
            self.warnings.append("warning_tok_moses_en")
            '''
            self.tokenizer = WordPunctTokenizer()
            self.toktype = "nltk_wordpunct"
            self.warnings.append("warning_tok_nltk_wordpunct")

    def tokenize(self, sent):
        try:    
            if self.toktype == "moses":
                return self.tokenizer(sent, escape=False)
            
            elif self.toktype == "nltk_wordpunct" :
                return self.tokenizer.tokenize(sent)
   
            elif self.toktype.startswith("nltk_punkt_"):
                nltk_lang = self.toktype.split("_")[2]
                return self.tokenizer(sent, language=nltk_lang)
   
            elif self.toktype == "mecab":
                return self.tokenizer.parse(sent).split()
   
            elif self.toktype.startswith("reldi_"):
                #tokstring looks like "'1.1.1.1-5\tHello\n1.1.2.6-6\t,\n1.1.3.8-11\tgood\n1.1.4.13-19\tmorning\n\n'"
                reldi_lang = self.toktype.split("_")[1]
                tokstring =  self.tokenizer.run(lang=reldi_lang, text=sent)
                tokens = []
                for token in tokstring.split("\t"):
                    if "\n" in  token:
                        tokens.append(token.split("\n")[0])
                return tokens        
   
            elif self.toktype == "pds":
                return self.tokenizer(sent, lang="mm", form="word")


            elif self.toktype == "sinling":
                return self.tokenizer.tokenize(sent)

            elif self.toktype == "fitrat":
                return self.tokenizer(sent)
        

            elif self.toktype == "bnlp":
                return self.tokenizer.word_tokenize(text=sent)
        
            elif self.toktype == "thai": 
                return [t for t in self.tokenizer(sent) if t != " "] #This tokenizer returns empty spaces too
     
            elif self.toktype.startswith("indic_"):
                indic_lang = self.toktype.split("_")[1]
                return self.tokenizer.trivial_tokenize(sent, lang=indic_lang)
        
            elif self.toktype == "pkuseg":
                return self.tokenizer.cut(sent)
        
            elif self.toktype == "hebrew":            
                objs = self.tokenizer.tokenize(sent) #this is a generator of objects: ('HEBREW', 'למכולת', 9, (41, 47))  (The hebrew word is in index 1, but RTL languages messing it all)
                tokens = []
                for obj in objs:
                    tokens.append(obj[1])
                return tokens
            
            elif self.toktype == "nlpid":
                return self.tokenizer.tokenize(sent)    
        
            elif self.toktype == "botok":
                objects = self.tokenizer.tokenize(sent)
                tokens = []
                for obj in objects:
                    tokens.append(obj.text)
                return tokens
                
            elif self.toktype == "klpt":
                tokens = self.tokenizer.word_tokenize(sent, keep_form=True, separator= " ")
                return tokens
                
            elif self.toktype == "pycantonese":
                tokens = self.tokenizer(sent)
                return tokens
                
            elif self.toktype == "laonlp":
                tokens = self.tokenizer(sent)
                return tokens
            
            elif self.toktype == "openodia":
                tokens = self.tokenizer(sent)
                return tokens            
            
            elif self.toktype == "igbo":
                tokens = self.tokenizer.tokenize(sent)
                return tokens
                
            else:
                return None #TO DO Do something better here --> Because THIS CRASHES
        except Exception as ex:
            logging.error("Failed at tokenizing: " + sent)
            logging.error(ex)
            return []
    

    def getWarnings(self):
        return self.warnings
