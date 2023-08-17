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
                        "el": "greek",
                        "en": "english",
                        "es": "spanish",
                        "eu": "basque",
                        "fi": "finnish",
                        "fr": "french",
                        "he": "hebrew",
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
                        "sl": "slovene",
                        "sv": "swedish",
                        "zh": "chinese"}

ASTUANA_STOPWORDS_LANGS = ["bg","fa", "ga", "gl", "hi", "hy", "ja",  "ko", "la", "lv", "mr", "pl", "th", "uk"]

ISO_STOPWORDS_LANGS =  ["af", "et", "gu", "so", "sw","tl"]

TXT_STOPWORDS_LANGS =  ["be", "is", "ky", "my", "pa", "sq", "sr", "ta", "te", "uz"] 

def fix_stopwords(stopwords, lang):
    if lang == "af":
        stopwords.extend(["u", "n", "s", "dis", "ja"])
    elif lang == "be":
        stopwords.extend(["я", "не", "i", "на", "в", "по", "у", "і", "до", "для", "є", "а", "за", "так", "все",  "што", "з", "таму", "мы", "па", "вы"])
    elif lang == "ca":
        stopwords.extend(["l", "l'", "d", "d'", "s", "s'"])
    elif lang == "es":
        stopwords.extend(["si", "quiero", "alguna", "cada", "puede", "cuándo", "casi", "creo", "aquí", "tal", "toda", "cuánto"])
    elif lang == "en":
        stopwords.extend(["shall", "unto", "thou", "thus", "'s",  "every", "among", "therefore", "let", "us"])
    elif lang == "fr":
        stopwords.extend(["c'", "d'", "j'", "l'", "m'", "n'", "s'", "t'", "qu'"]) #These are missing in nltk when with apostrophe
    elif lang == "gl":
        stopwords.extend(["como", "máis", "si", "són", "todo", "outra", "ás", "moito", "xa", "todos", "nada", "cal", "son", "só", "agora", "onde", "quen", "cada", "algo", "porque", "sei", "vai", "algunha", "toda" ])    
    elif lang == "it":
        stopwords.extend(["l'", "un'", "qualcun'","nessun'", "qualcos'", "dov'", "po'", "va'", "fa'", "dell'", "all'" ]) #same as french
    elif lang == "pl":
        stopwords.extend(["w", "i", "z", "ze", "oraz", "a", "o"])
    elif lang == "uk":
        stopwords.extend(["я", "не", "i", "на", "в", "по", "у", "і", "до", "для", "є", "а", "за", "так", "все" ])
    return stopwords

def get_ngrams(lang, tokenized_sentences, max_order):
    warnings=[]
    
    # Lowercase everything    
    tokens = [token.lower() for token in tokenized_sentences]

    # Language-agnostic strategy for stopwords, can be improved
    stop_words = []
    
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

