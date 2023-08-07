import mecab_ko
import reldi_tokeniser
#from nlpashto import word_segment
from sacremoses import MosesTokenizer
from nltk.tokenize import word_tokenize

MOSES_LANGS = ["ca", "cs", "de", "el", "en", "es", "fi", "fr", "hu", "is", "it", "lv", "nl", "pl", "pt", "ro", "ru", "sk", "sl", "sv", "ta"]

NLTK_WORD_LANGS = ["ar"]
NLTK_PUNKT_LANGS = {"no": "norwegian"}

RELDI_LANGS  = ["sr"]

MOSES_FALLBACK = {"af": "nl",
                 "eo": "en"}

NLTK_FALLBACK = {"nb": "no"}

MECAB_KO = ["ko"]

#NLPASHTO_LANGS = ["ps"]

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
            self.tokenizer = word_tokenize
            self.toktype = "nltk_word"
            self.warnings.append("warning_tok_nltk_word")
        elif lang in NLTK_PUNKT_LANGS.keys():
            self.tokenizer = word_tokenize
            self.toktype = "nltk_punkt_" + NLTK_PUNKT_LANGS.get(lang)
        elif lang in NLTK_FALLBACK.keys():
            nltk_langcode = NLTK_FALLBACK.get(lang)
            nltk_langname = NLTK_PUNKT_LANGS.get(nltk_langcode)
            self.tokenizer = word_tokenize
            self.toktype = "nltk_punkt_" + nltk_langname
            self.warnings.append("warning_tok_nltk_punkt_"+nltk_langcode)           

        elif lang in MECAB_KO:
            self.tokenizer = mecab_ko.Tagger("-Owakati")
            self.toktype = "mecab"            
#        elif lang in NLPASHTO_LANGS:
#            self.tokenizer = word_segment(sent)
#            self.toktype = "nlpashto"
        elif lang in RELDI_LANGS:
            self.tokenizer = reldi_tokeniser
            self.toktype = "reldi"
        else:
            self.tokenizer =  MosesTokenizer("en")
            self.toktype = "moses"
            self.warnings.append("warning_tok_moses_en")


    def tokenize(self, sent):
        if self.toktype == "moses":
            return self.tokenizer(sent, escape=False)
        elif self.toktype == "nltk_word":
            return self.tokenizer(sent)
        elif self.toktype.startswith("nltk_punkt_"):
            nltk_lang = self.toktype.split("_")[2]
            return self.tokenizer(sent, language=nltk_lang)
        elif self.toktype == "mecab":
            return self.tokenizer.parse(sent).split()
        elif self.toktype == "reldi":
            #tokstring looks like "'1.1.1.1-5\tHello\n1.1.2.6-6\t,\n1.1.3.8-11\tgood\n1.1.4.13-19\tmorning\n\n'"
            tokstring =  self.tokenizer.run(lang=self.lang, text=sent)
            tokens = []
            for token in tokstring.split("\t"):
                if "\n" in  token:
                    tokens.append(token.split("\n")[0])
            return tokens        

#        elif self.toktype == "nlpashto":
#            return self.tokenizer(sent)
        else:
            return None #TO DO Do something better here
         
    

    def getWarnings(self):
        return self.warnings
