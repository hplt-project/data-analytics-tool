import os
import logging

import stopwords as astuana_stopwords
from nltk import ngrams
from nltk.corpus import stopwords as nltk_stopwords
from stopwordsiso import stopwords as iso_stopwords
from collections import Counter
from klpt.preprocess import Preprocess as KurdishPreprocess
from laonlp.corpus.lao_words import lao_stopwords
from openodia.common.constants import STOPWORDS as odia_stopwords
from etnltk.lang.am import STOP_WORDS as amharic_stopwords
from etnltk.lang.tg import STOP_WORDS as tigrinya_stopwords

import pycantonese

NLTK_STOPWORDS_LANGS =  {"ar": "arabic",
                        "az": "azerbaijani",                        
                        "bn": "bengali",
                        "ca": "catalan",
                        "da": "danish",
                        "de": "german",
                        "el": "greek",
                        "en": "english",
                        "es": "spanish",
                        "eu": "basque",
                        "fi": "finnish",
                        "fr": "french",
                        "he": "hebrew",
                        "hu": "hungarian",
                        "id": "indonesian",
                        "it": "italian",
                        "iw": "hebrew",
                        "kk": "kazakh",
                        "nb": "norwegian",
                        "ne": "nepali",
                        "npi": "nepali",
                        "nl": "dutch",
                        "nn": "norwegian",
                        "no": "norwegian",
                        "pt": "portuguese",
                        "ro": "romanian",
                        "ru": "russian",
                        "sl": "slovene",
                        "sv": "swedish",
                        "tg": "tajik",
                        "tr": "turkish",
                        "zh": "chinese",
                        "zh-hant": "chinese",
                        "zh-hans": "chinese"}
                        
NLTK_STOPWORDS_MAPS = {"azj": "az",  "ara": "ar", "ben": "bn", "cat": "ca", "dan": "da", "deu": "de", "ell": "el", "eng": "en", 
                        "spa": "es", "eus": "eu", "fin": "fi", "fra": "fr", "heb": "he", "hun": "hu", "ind": "id", "ita": "it", 
                        "kaz": "kk", "nob": "nb", "npi": "ne", "nld": "nl", "nno": "nn", "por": "pt", "ron": "ro", "rus": "ru",
                        "slv": "sl", "swe": "sv", "tgk": "tg", "tur": "tr"}


ASTUANA_STOPWORDS_LANGS = ["bg","cs", "fa", "ga", "gl", "hi", "hy", "ja",  "ko", "la",  "lv", "mr", "pl", "sk", "th", "uk", "ur"]
ASTUANA_STOPWORDS_MAPS = {"pes": "fa", "lvs": "lv", "bul": "bg", "ces": "cs", "fas": "fa", "gle": "ga", "glg": "gl", "hin": "hi", 
                            "hye": "hy", "jpn": "ja", "kor": "ko", "lat": "la", "lvs": "lv", "mar": "mr", "pol": "pl",
                            "slk": "sk", "tha": "th", "ukr": "uk", "urd": "ur"}

ISO_STOPWORDS_LANGS =  ["af", "br", "eo", "et", "gu", "hr", "ms", "so", "sw","tl", "vi", "zu"]
ISO_STOPWORDS_MAPS = {"zsm": "ms", "swh": "sw", "afr": "af", "bre": "br", "epo": "eo", "est": "et", "guj": "gu", "hrv": "hr",
                        "som": "so", "tgl": "tl", "vie": "vi", "zul": "zu"}

TXT_STOPWORDS_LANGS =  ["ab", "ace", "als", "as", "ast", "ayr", "awa", "azb", "ba", "ban", "bem", "be", "bho", "bjn", "bm", "bo", "bs", "bug",  
                        "ceb", "cjk", "co", "crh", "cy", "dik", "dyu", "dz", "ee", "fj", "fo", "fon", "fur", "fuv", "gaz", "gd", "gn",
                        "ha", "hne", "ht", "ig", "ilo", "is", "jv", "ka", "kab", "kac", "kam", "kbp", "kea", "ki", 
                        "kg",  "km", "kmb", "kn", "knc", "ks", "ky", "lb", "lg", "li", "lij", "lmo", "ln", "lt", "ltg", "lua", "luo", "lus",
                        "mag", "mai", "me", "mi", "min", "mk", "ml", "mn", "mni", "mos", "mt", "my", "nso", "nus", "ny", "oc",
                        "pa", "pag", "pap", "pbt", "plt", "prs", "ps", "quy", "rn", "rw", 
                        "sa", "sat", "sc", "scn", "sd", "sg", "shn", "si", "sm", "sn", "sq", "sr", "ss", "st", "su", "szl",
                        "ta", "taq", "te", "tk", "tn", "tpi", "ts", "tt", "tum", "tw", "tzm", 
                        "ug", "umb", "uz", "uzn", "vec", "war", "wo", "xh", "ydd", "yo"] 

TXT_STOPWORDS_MAPS = {"khk": "mn", "abk": "ab", "bak": "ba", "bel": "be", "bam": "bm", "aym": "ayr", "bod": "bo", "bos": "bo",
                        "cnr": "me", "cos": "co", "cym": "cy", "dzo": "dz", "ewe": "ee", "fij": "fj", "fao": "fo", "ful": "fuv",
                        "gla": "gd", "grn": "gn", "hau": "ha", "hat": "ht", "ibo": "ig", "isl": "is", "jav": "jv", "kat": "ka",
                        "kik": "ki", "kon": "kg", "khm": "km", "kan": "kn", "kas": "ks", "kir": "ky", "lit": "lt", "ltz": "lb", "lug": "lg",
                        "lim": "li", "lin": "li", "mri": "mi", "mkd": "mk", "mal": "ml", "khk": "mn", "mlt": "mt", "mya": "my",
                        "nya": "ny", "oci": "oc", "pan": "pa", "pbt": "ps", "run": "rn", "kin": "rw", "san": "sa", "srd": "sc",
                        "snd": "sd", "sag": "sg", "sin": "si", "smo": "sm", "sna": "sn", "als": "sq", "srp": "sr", "ssw": "ss",
                        "sot": "st", "sun": "su", "tam": "ta", "tel": "te", "tuk": "tk", "tsn": "tn", "tso": "ts", "tat": "tt",
                        "twi": "tw", "uig": "ug", "uzn": "uz", "wol": "wo", "xho": "xh", "yor": "yo"}

KLPT_STOPWORDS_LANGS = ["ckb", "kmr"]

CANTONESE_LANGS = ["yue"]

LAONLP_LANGS = ["lo", "lao"]

OPENODIA_LANGS = ["ory"]

ETHIOPIC_LANGS = ["am", "ti", "amh", "tir"]


def fix_stopwords(stopwords, lang):
    if lang == "af":
        stopwords.extend(["u", "n", "s", "dis", "ja", "word", "of", "deur", "hierdie", "ook", "tot"])
    elif lang == "als" or lang == "sq":
        stopwords.extend(["është", "shumë", "tė", "duhet", "gjithë"])
    elif lang == "ar":
        stopwords.extend(["يمكن", "خلال", ])
    elif lang == "as":
        stopwords.extend(["এই", "হয়"])
    elif lang == "be":
        stopwords.extend(["я", "не", "i", "на", "в", "по", "у", "і", "до", "для", "є", "а", "за", "так", "все",  "што", "з", "таму", "мы", "па", "вы", "ў", "да", "як", "ад", "калі"])
    elif lang == "bg":
        stopwords.extend(["можете"])
    elif lang == "bs":
        stopwords.extend(["čiju"])
    elif lang == "ca":
        stopwords.extend(["l", "l'", "d", "d'", "s", "s'", "pot"])
    elif lang == "ceb":
        stopwords.extend(["usa", "ni", "na"])
    elif lang == "cy":
        stopwords.extend(["'r", "r", "'n", "n", "'i", "'w","'y", "'m", "'u", "'th"])
        for sw in [ 'about', 'an', 'as', 'you', 'be', 'but', 'by', 'from', 'get', 'have', 'he', 'him', 'his', 'if', 'it', 'just', 'know', 'like', 'make', 'me', 'my', 'no', 'not', 'one', 'or', 'out', 'say', 'she', 'so', 'take', 'that', 'their', 'there', 'they', 'this', 'time', 'up', 'what', 'when', 'which', 'who', 'will', 'with', 'would']:
            stopwords.remove(sw)
    elif lang == "de":
        stopwords.extend(["wurde", "wurden", "mehr", "viele"])
    elif lang == "en":
        stopwords.extend(["shall", "unto", "thou", "thus", "'s",  "every", "among", "therefore", "let", "us", "also", "one", "may"])
    elif lang == "es":
        stopwords.extend(["si", "quiero", "alguna", "cada", "puede", "cuándo", "casi", "creo", "aquí", "tal", "toda", "cuánto"])
    elif lang == "et":
        stopwords.extend(["või", "ning", "ka", "teie", "meie"])
    elif lang == "eu":
        stopwords.extend(["zure", "gure", "duzu", "guztiak"])
    elif lang == "fa":
        stopwords.extend(["این", "برای"])
    elif lang == "fi":
        stopwords.extend(["myös", "n", "kaikki"])
    elif lang == "fj":
        stopwords.extend(["ena", "mai", "ira"])
    elif lang == "fo":
        stopwords.extend(["í", "at", "er", "á"])
    elif lang == "fr":
        stopwords.extend(["c'", "d'", "j'", "l'", "m'", "n'", "s'", "t'", "qu'"]) #These are missing in nltk when with apostrophe
    elif lang == "ga":
        stopwords.extend(["tá", "seo", "má", "sin"])
    elif lang == "gl":
        stopwords.extend(["como", "máis", "si", "són", "todo", "outra", "ás", "moito", "xa", "todos", "nada", "cal", "son", "só", "agora", "onde", "quen", "cada", "algo", "porque", "sei", "vai", "algunha", "toda", "entre" ])    
    elif lang == "gu":
        stopwords.extend(["કરવા"])
    elif lang == "ha":
        stopwords.extend(["haka"])
    elif lang == "hi":
        stopwords.extend(["भी", "हम", "आपको"])
    elif lang == "hr":
        stopwords.extend(["može", "možete", "više", "mogu"])
    elif lang == "hy":
        stopwords.extend(["մասին", "թե"])
    elif lang == "ig":
        stopwords.extend(["ndị", "ya"])
    elif lang == "is":
        stopwords.extend(["ekki", "hefur", "eru", "hafa", "einnig"])
    elif lang == "it":    
        stopwords.extend(["l'", "un'", "qualcun'","nessun'", "qualcos'", "dov'", "po'", "va'", "fa'", "dell'", "all'" ]) #same as french
    elif lang == "jv":
        stopwords.extend(["kanthi"])
    elif lang == "ka":
        stopwords.extend(["ეს", "ის", "არის", "იყო"])
    elif lang == "kk":
        stopwords.extend(["да", "бір", "бойынша", "немесе"])
    elif lang == "kn":
        stopwords.extend(["ನಮ್ಮ", "ನಿಮ್ಮ", "ನೀವು", "ನಾನು", "ನನ್ನ", "ನಾವು"])
    elif lang == "lo":
        stopwords.extend(["ທ່ານ", "ລາວ", "ແມ່ນ"])
    elif lang == "lt":
        stopwords.extend(["į", "iš", "jūsų"])
    elif lang == "lv":
        stopwords.extend(["kas", "jūsu", "jūs", "jums"])
    elif lang == "mi":
        stopwords.extend(["te", "o", "ki", "me", "nga"])
    elif lang == "mk":
        stpowords.extend(["овие"])
    elif lang == "ml":
        stopwords.extend(["ഞാന്", "ചെയ്യുക"])
    elif lang == "mr":
        stopwords.extend(["किंवा", "आपण", "आम्ही"])
    elif lang == "my":
        stopwords.extend(["ကို", "ခဲ့"])
    elif lang == "nb":
        stopwords.extend(["få"])
    elif lang == "ne" or lang == "npi":
        stopwords.extend(["गरिएको", "वा"])
    elif lang == "nn":
        stopwords.extend(["frå", "ei", "meir", "andre", "må"]) 
    elif lang == "ny":
        stopwords.extend(["ndi", "ku"])
    elif lang == "pl":
        stopwords.extend(["w", "i", "z", "ze", "oraz", "a", "o"])
    elif lang == "ru":
        stopwords.extend(["з", "это", "т", "н"])
    elif lang == "sk":
        stopwords.extend(["môžete", "ste"])
    elif lang == "sl":
        stopwords.extend(["več"])
    elif lang == "so":
        stopwords.extend(["iyo", "ee", "la"])
    elif lang == "sr":
        stopwords.extend(["који", "као", "које", "може"])
    elif lang == "su":
        stopwords.extend(["ka", "sareng", "teu", "ti"])
    elif lang == "sw" or lang == "swh":
        stopwords.extend(["au"])
    elif lang == "ta":
        stopwords.extend(["நீங்கள்", "நாங்கள்"])
    elif lang == "te":
        stopwords.extend(["ఈ", "ఆ", "లో", "తన", "మీరు", "యొక్క"])
    elif lang == "th":
        stopwords.extend(["คุณ", "สามารถ", "สำหรับ"])
    elif lang == "tl":
        stopwords.extend(["mo", "lang", "naman"])
    elif lang == "tr":
        stopwords.extend(["bir", "olarak", "olan"])
    elif lang == "uk":
        stopwords.extend(["я", "не", "i", "на", "в", "по", "у", "і", "до", "для", "є", "а", "за", "так", "все", "від", "або", "щоб", "які", "також" ])
    elif lang == "ur":
        stopwords.extend(["میں", "سے", "کا", "کو"])
    elif lang == "uz":
        stopwords.extend(["ва", "билан", "учун", "бу"])  
    elif lang == "ydd":
        stopwords.extend(["פון", "צו", "נישט"])
    elif lang == "yo":
        stopwords.extend(["awọn", "ati", "lati", "si", "fun"])
    elif lang == "zsm" or lang == "ms":
        stopwords.extend(["anda"])
    elif lang == "zu":
        stopwords.extend(["noma", "lokhu"])
    return stopwords

def get_stopwords(lang):
    # Language-agnostic strategy for stopwords, can be improved
    stop_words = []
    warnings = []    
    if lang in NLTK_STOPWORDS_LANGS.keys():        
        logging.info("Stopwords from NLTK")
        langname = NLTK_STOPWORDS_LANGS.get(lang)
        stop_words = nltk_stopwords.words(langname)        
        stop_words = fix_stopwords(stop_words, lang)
    
    elif lang in NLTK_STOPWORDS_MAPS.keys():
        logging.info("Stopwords from NLTK - mapped")
        mapped = NLTK_STOPWORDS_MAPS.get(lang)
        langname = NLTK_STOPWORDS_LANGS.get(mapped)
        stop_words = nltk_stopwords.words(langname)
        stop_words = fix_stopwords(stop_words, lang)
                
    elif lang in ASTUANA_STOPWORDS_LANGS:
        logging.info("Stopwords from Astuana")
        stop_words = astuana_stopwords.get_stopwords(lang)
        stop_words = fix_stopwords(stop_words, lang)
    
    elif lang in ASTUANA_STOPWORDS_MAPS.keys():
        logging.info("Stopwords from Astuana - mapped")
        mapped = ASTUANA_STOPWORDS_MAPS.get(lang)
        stop_words = astuana_stopwords.get_stopwords(mapped)
        stop_words = fix_stopwords(stop_words, lang)
        
    elif lang in ISO_STOPWORDS_LANGS:
        logging.info("Stopwords from ISO")
        stop_words = list(iso_stopwords(lang))
        stop_words = fix_stopwords(stop_words, lang)
    
    elif lang in ISO_STOPWORDS_MAPS.keys():
        logging.info("Stopwords from ISO - mapped")
        mapped = ISO_STOPWORDS_MAPS.get(lang)
        stop_words = list(iso_stopwords(mapped))
        stop_words = fix_stopwords(stop_words, lang)

    elif lang in TXT_STOPWORDS_LANGS:        
        logging.info("Stopwords from list")
        with open(os.path.dirname(os.path.abspath(__file__))+"/resources/stopwords."+lang, "r") as swf:
            for sw in swf:
                stop_words.append(sw.strip()) 
        stop_words = fix_stopwords(stop_words, lang)
        
    elif lang in TXT_STOPWORDS_MAPS.keys():
        logging.info("Stopwords from list - mapped")
        mapped = TXT_STOPWORDS_MAPS.get(lang)
        with open(os.path.dirname(os.path.abspath(__file__))+"/resources/stopwords."+mapped, "r") as swf:
            for sw in swf:
                stop_words.append(sw.strip()) 
        stop_words = fix_stopwords(stop_words, lang)

        
    elif lang in KLPT_STOPWORDS_LANGS:
        logging.info("Stopwords from KLPT")
        if lang == "kmr":
            kp = KurdishPreprocess("Kurmanji", "Latin")
        elif lang == "ckb":
            kp = KurdishPreprocess("Sorani", "Arabic")
        stop_words = kp.stopwords
        stop_words = fix_stopwords(stop_words, lang)
    
    elif lang in CANTONESE_LANGS:
        logging.info("Stopwords from pycantonese")
        stopwords = list(pycantonese.stop_words())
        stop_words = fix_stopwords(stopwords, lang)    
    
    elif lang in LAONLP_LANGS:
        logging.info("Stopwords from LaoNLP")
        stopwords = list(lao_stopwords())
        stop_words = fix_stopwords(stopwords, lang)
        
    elif lang in OPENODIA_LANGS:
        logging.info("Stopwords from OpenOdia")
        stopwords = odia_stopwords
        stop_words = fix_stopwords(stopwords, lang)
    
    elif lang in ETHIOPIC_LANGS:
        if lang == "am" or lang == "amh":
            stopwords = amharic_stopwords
        elif lang == "ti" or lang == "tir":
            stopwords = tigrinya_stopwords
        stop_words = fix_stopwords(stopwords, lang)

    else:    
        stop_words = [""] #ñapa to avoid it crashing
        warnings = ["ngrams_"+lang+"_nostopwords"]
        
        '''
        logging.info("Stopwords on the fly")
        # Count the frequencies of each token
        token_freq = Counter(tokens)
        # Calculate the number of tokens to keep (1% of the total number of unique tokens)
        num_tokens_to_keep = int(len(token_freq) * 0.01)
        # Get the top tokens with the highest frequency
        stop_words = [token for token, freq in token_freq.most_common(num_tokens_to_keep)]
        warnings = ["ngrams_" + lang + "_freq"]        
        '''
    logging.info("Stopwords: " + str(stop_words))
    return list(set(stop_words)), warnings

def get_line_ngrams(lang, tokenized_line, max_order, stop_words):
    warnings = []
    if not stop_words:
        stop_words, warnings = get_stopwords(lang)
    tokens = [token.lower() for token in tokenized_line]
    candidates = {}
    for order in range(max_order, 0, -1):
        candidates[order] = [] #initialize map
        corpus_ngrams = list(ngrams(tokens,order))
        for candidate in corpus_ngrams:
            if not (all(any(c.isalpha() for c in word) for word in candidate)):
                #Remove any token that not contains alphabetic
                #if token contains punctuation, we don't want it
                continue
            #There is at least a token that is not a stopword
            #First and last tokens cannot be stopwords 
            #Not using .lower() becase all tokens were lowerized at the beginning
            if(candidate[0] not in stop_words) and (candidate[-1] not in stop_words) and any(token not in stop_words for token in candidate):
                candidates[order].append(candidate)
    return candidates, warnings
    

def get_ngrams(lang, tokenized_sentences, max_order):
    stop_words, warnings = get_stopwords(lang)
    
    # Lowercase everything    
    tokens = [token.lower() for token in tokenized_sentences]
            
    # Get ngrams
    candidates = {}
    for order in range(max_order, 0, -1):
        candidates[order] = [] #initialize map
        corpus_ngrams = list(ngrams(tokens,order))
        #ngrams_counts = Counter(corpus_ngrams).most_common(100)
        for candidate in corpus_ngrams:           
            #if any(token.lower() == token.upper() for token in candidate):  #Removing this since it fails with non-latin languages
            if not (all(any(c.isalpha() for c in word) for word in candidate)):
                #Remove any token that not contains alphabetic
                #if token contains punctuation, we don't want it
                #print("Removed: " + str(candidate))
                continue
            #There is at least a token that is not a stopword
            #First and last tokens cannot be stopwords
            #Not using .lower() becase all tokens were lowerized at the beginning
            if(candidate[0] not in stop_words) and (candidate[-1] not in stop_words) and any(token not in stop_words for token in candidate):
                candidates[order].append(candidate)
                
    final_ngrams = {}
    for order in candidates:
        final_ngrams[str(order)]=Counter(candidates[order]).most_common(5)
    return final_ngrams, warnings

