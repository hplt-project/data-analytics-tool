from sacremoses import MosesTokenizer

MOSES_LANGS = ["ca", "cs", "de", "el", "en", "es", "fi", "fr", "hu", "is", "it", "lv", "nl", "pl", "pt", "ro", "ru", "sk", "sl", "sv", "ta"]

class CustomTokenizer:


    def  __init__(self, lang):
        self.lang = lang
        self.tokenizer, self.toktype, self.warnings = self.setTokenizer(lang)
    

    def setTokenizer(self, lang):
        if lang in MOSES_LANGS:
            return MosesTokenizer(lang), "moses", None
        else:
            return MosesTokenizer("en"), "moses", "warning_tok_default_moses_en"        


    def tokenize(self, sent):
        if self.toktype == "moses":
            return self.tokenizer.tokenize(sent, escape=False)
        else:
            return "oops"
    

