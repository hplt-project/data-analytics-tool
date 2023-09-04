import os
import logging

import stopwords as astuana_stopwords
from nltk import ngrams
from nltk.corpus import stopwords as nltk_stopwords
from stopwordsiso import stopwords as iso_stopwords
from collections import Counter

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
                        "nl": "dutch",
                        "nn": "norwegian",
                        "no": "norwegian",
                        "pt": "portuguese",
                        "ro": "romanian",
                        "ru": "russian",
                        "sl": "slovene",
                        "sv": "swedish",
                        "tr": "turkish",
                        "zh": "chinese",
                        "zh-Hant": "chinese"}

ASTUANA_STOPWORDS_LANGS = ["bg","cs", "fa", "ga", "gl", "hi", "hy", "ja",  "ko", "la", "lt",  "lv", "mr", "pl", "sk", "th", "uk", "ur"]

ISO_STOPWORDS_LANGS =  ["af", "eo", "et", "gu", "hr", "ms", "so", "sw","tl", "vi"]

TXT_STOPWORDS_LANGS =  ["be", "bs", "cy", "is", "ka", "kn", "ky", "mk", "mn",  "my", "pa", "ps", "si", "sq", "sr", "ta", "te", "tt",  "uz"] 



def fix_stopwords(stopwords, lang):
    if lang == "af":
        stopwords.extend(["u", "n", "s", "dis", "ja"])
    elif lang == "be":
        stopwords.extend(["я", "не", "i", "на", "в", "по", "у", "і", "до", "для", "є", "а", "за", "так", "все",  "што", "з", "таму", "мы", "па", "вы"])
    elif lang == "bs":
        stopwords.extend(["čiju"])
    elif lang == "ca":
        stopwords.extend(["l", "l'", "d", "d'", "s", "s'"])
    elif lang == "de":
        stopwords.extend(["wurde", "wurden", "mehr", "viele"])
    elif lang == "es":
        stopwords.extend(["si", "quiero", "alguna", "cada", "puede", "cuándo", "casi", "creo", "aquí", "tal", "toda", "cuánto"])
    elif lang == "en":
        stopwords.extend(["shall", "unto", "thou", "thus", "'s",  "every", "among", "therefore", "let", "us"])
    elif lang == "fr":
        stopwords.extend(["c'", "d'", "j'", "l'", "m'", "n'", "s'", "t'", "qu'"]) #These are missing in nltk when with apostrophe
    elif lang == "ga":
        stopwords.extend(["tá", "seo", "má"])
    elif lang == "gl":
        stopwords.extend(["como", "máis", "si", "són", "todo", "outra", "ás", "moito", "xa", "todos", "nada", "cal", "son", "só", "agora", "onde", "quen", "cada", "algo", "porque", "sei", "vai", "algunha", "toda" ])    
    elif lang == "is":
        stopwords.extend(["ekki", "hefur", "eru"])
    elif lang == "it":
        stopwords.extend(["l'", "un'", "qualcun'","nessun'", "qualcos'", "dov'", "po'", "va'", "fa'", "dell'", "all'" ]) #same as french
    elif lang == "nn":
        stopwords.extend(["frå", "ei", "meir", "andre"]) 
    elif lang == "pl":
        stopwords.extend(["w", "i", "z", "ze", "oraz", "a", "o"])
    elif lang == "ru":
        stopwords.extend(["з", "это", "т", "н"])
    elif lang == "uk":
        stopwords.extend(["я", "не", "i", "на", "в", "по", "у", "і", "до", "для", "є", "а", "за", "так", "все" ])
    return stopwords

def get_stopwords(lang):
    # Language-agnostic strategy for stopwords, can be improved
    stop_words = []
    warnings =   []    
    if lang in NLTK_STOPWORDS_LANGS.keys():        
        logging.info("Stopwords from NLTK")
        langname = NLTK_STOPWORDS_LANGS.get(lang)
        stop_words = nltk_stopwords.words(langname)        
        stop_words = fix_stopwords(stop_words, lang)
                
    elif lang in ASTUANA_STOPWORDS_LANGS:
        logging.info("Stopwords from Astuana")
        stop_words = astuana_stopwords.get_stopwords(lang)
        stop_words = fix_stopwords(stop_words, lang)
        
    elif lang in ISO_STOPWORDS_LANGS:
        logging.info("Stopwords from ISO")
        stop_words = list(iso_stopwords(lang))
        stop_words = fix_stopwords(stop_words, lang)

    elif lang in TXT_STOPWORDS_LANGS:        
        logging.info("Stopwords from list")
        with open(os.path.dirname(os.path.abspath(__file__))+"/resources/stopwords."+lang, "r") as swf:
            for sw in swf:
                stop_words.append(sw.strip()) 
        stop_words = fix_stopwords(stop_words, lang)
        
    else:    
        logging.info("Stopwords on the fly")
        # Count the frequencies of each token
        token_freq = Counter(tokens)
        # Calculate the number of tokens to keep (1% of the total number of unique tokens)
        num_tokens_to_keep = int(len(token_freq) * 0.01)
        # Get the top tokens with the highest frequency
        stop_words = [token for token, freq in token_freq.most_common(num_tokens_to_keep)]
        warnings = ["ngrams_" + lang + "_freq"]        
    
    logging.info("Stopwords: " + str(stop_words))
    return stop_words, warnings

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

