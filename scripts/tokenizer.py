import mecab_ko

from sacremoses import MosesTokenizer
from nltk.tokenize import word_tokenize

MOSES_LANGS = ["ca", "cs", "de", "el", "en", "es", "fi", "fr", "hu", "is", "it", "lv", "nl", "pl", "pt", "ro", "ru", "sk", "sl", "sv", "ta"]
NLTK_WORD_LANGS = ["ar"]
NLTK_PUNKT_LANGS = {"no": "norwegian"}

MOSES_NL = ["af"]
MOSES_EN = ["eo"]

MECAB_KO = ["ko"]

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
        elif lang in MOSES_NL:
            self.tokenizer = MosesTokenizer("nl").tokenize
            self.toktype =  "moses"
            self.warnings.append("warning_tok_moses_nl")
        elif lang in MOSES_EN:
            self.tokenizer = MosesTokenizer("en").tokenize
            self.toktype = "moses"
            self.warnings.append("warning_tok_moses_en")
        elif lang in NLTK_WORD_LANGS:
            self.tokenizer = word_tokenize
            self.toktype = "nltk_word"
            self.warnings.append("warning_tok_nltk_word")
        elif lang in NLTK_PUNKT_LANGS.keys():
            self.tokenizer = word_tokenize
            self.toktype = "nltk_punkt_" + NLTK_PUNKT_LANGS.get(lang)
        elif lang in MECAB_KO:
            self.tokenizer = mecab_ko.Tagger("-Owakati")
            self.toktype = "mecab"            
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
        else:
            return None #TO DO Do something better here
         
    

    def getWarnings(self):
        return self.warnings
