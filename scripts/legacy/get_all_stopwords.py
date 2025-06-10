import ngrams

langcodes = []


langcodes.extend(list(ngrams.NLTK_STOPWORDS_LANGS.keys()))
langcodes.extend(list(ngrams.NLTK_STOPWORDS_MAPS.keys()))
langcodes.extend(ngrams.ASTUANA_STOPWORDS_LANGS)
langcodes.extend(list(ngrams.ASTUANA_STOPWORDS_MAPS.keys()))
langcodes.extend(ngrams.ISO_STOPWORDS_LANGS)
langcodes.extend(list(ngrams.ISO_STOPWORDS_MAPS.keys()))
langcodes.extend(ngrams.TXT_STOPWORDS_LANGS)
langcodes.extend(list(ngrams.TXT_STOPWORDS_MAPS.keys()))
langcodes.extend(ngrams.KLPT_STOPWORDS_LANGS)
langcodes.extend(ngrams.CANTONESE_LANGS)
langcodes.extend(ngrams.LAONLP_LANGS)
langcodes.extend(ngrams.OPENODIA_LANGS)
langcodes.extend(ngrams.ETHIOPIC_LANGS)




print(len(langcodes))

for langcode in langcodes:
    stopwords, warnings = ngrams.get_stopwords(langcode)

    with open (langcode+".txt", "w+") as swfile:
        for sw in stopwords:
            swfile.write(sw+"\n")
        