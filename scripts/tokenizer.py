from sacremoses import MosesTokenizer
from nltk.tokenize import word_tokenize

MOSES_LANGS = ["ca", "cs", "de", "el", "en", "es", "fi", "fr", "hu", "is", "it", "lv", "nl", "pl", "pt", "ro", "ru", "sk", "sl", "sv", "ta"]
NLTK_WORD_LANGS = ["ar"]

MOSES_NL = ["af"]
MOSES_EN = ["eo"]

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
        elif lang in NLTK_WORD_LANGS:
            self.tokenizer = word_tokenize
            self.toktype = "nltk_word"
            self.warnings.append("warning_tok_nltk_word")
        elif lang in MOSES_NL:
            self.tokenizer = MosesTokenizer("nl").tokenize
            self.toktype =  "moses"
            self.warnings.append("warning_tok_moses_nl")
        elif lang in MOSES_EN:
            self.tokenizer = MosesTokenizer("en").tokenize
            self.toktype = "moses"
            self.warnings.append("warning_tok_moses_en")
        else:
            self.tokenizer =  MosesTokenizer("en")
            self.toktype = "moses"
            self.warnings.append("warning_tok_moses_en")


    def tokenize(self, sent):
        if self.toktype == "moses":
            return self.tokenizer(sent, escape=False)
        elif self.toktype == "nltk_word":
            return self.tokenizer(sent)
        else:
            return None #TO DO Do something better here
         
    

    def getWarnings(self):
        return self.warnings
