from nltk import ngrams
from collections import Counter

def get_ngrams(tokens, max_order):
    # Lowercase everything
    tokens = [token.lower() for token in tokens]

    # Language-agnostic strategy for stopwords, can be improved

    # Count the frequencies of each token
    token_freq = Counter(tokens)
    # Calculate the number of tokens to keep (1% of the total number of unique tokens)
    num_tokens_to_keep = int(len(token_freq) * 0.01)
    # Get the top tokens with the highest frequency
    stop_words = [token for token, freq in token_freq.most_common(num_tokens_to_keep)]

    # Get ngrams
    candidates = {}
    for order in range(max_order, 0, -1):
        candidates[order] = [] #initialize map
        corpus_ngrams = list(ngrams(tokens,order))
        #ngrams_counts = Counter(corpus_ngrams).most_common(100)
        for candidate in corpus_ngrams:
                #if any(token.lower() == token.upper() for token in candidate):  #Removing this since it fails with non-latin languages
                #    #if token contains punctuation, we don't want it
                #    continue
                #There is at least a token that is not a stopword
                if any(token.lower() not in stop_words for token in candidate[0]): # this can be improved
                #if all(token.lower() not in stop_words for token in candidate): # this can be improved
                    candidates[order].append(candidate)
    final_ngrams = {}
    for order in candidates:
        final_ngrams[str(order)]=Counter(candidates[order]).most_common(5)
    return final_ngrams

