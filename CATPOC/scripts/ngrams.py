from collections import Counter

def get_common_ngrams(corpus, n):
    tokens = corpus.split()
    ngrams = []
    for i in range(len(tokens) - n + 1):
        ngram = ' '.join(tokens[i:i+n])
        ngrams.append(ngram)
    
    # Get the most common n-grams
    common_ngrams = Counter(ngrams).most_common(25)

    return common_ngrams