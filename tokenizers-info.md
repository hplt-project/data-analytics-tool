Tokenizers used for each language:

* ba, br, ca, cs, co, de, el, en, es, fi, fr, hu, is, it, lv, nl, pl, pt, ro, ru, sk, sl, sv, ta: sacremoses (MosesTokenizer) (https://github.com/hplt-project/sacremoses)
* ab, ba: sacremoses (MosesTokenizer), with fallback to ru
* af: sacremoses (MosesTokenizer), with fallback to nl
* br: sacremoses (MosesTokenizer), with fallback to fr
* co: sacremoses (MosesTokenizer), with fallback to it
* cy, eo, ga, la, lt, mt, so, sq, sw, tl: sacremoses  (MosesTokenizer) with fallback to en
* eu, gl: sacremoses (MosesTokenizer) with fallback to es
* ar, az, be, fa, hy, ka, kk, ky, mn, ms, ps, tt, uk, vi: NTLK word punct tokenizer (https://www.nltk.org/api/nltk.tokenize.punkt.html)  
* da, et, ml, no, tr: NLTK word tokenizer (https://www.nltk.org/api/nltk.tokenize.html)
* nb, nn: NTLK word tokenizer, with fallback to no
* sr, mk, bg, hr: Reldi (https://github.com/clarinsi/reldi-tokeniser)
* bs: Reldi, with fallback to sr
* ja: MeCab (https://github.com/SamuraiT/mecab-python3)
* ko: MeCab-ko (https://github.com/NoUnique/pymecab-ko)
* my: pyidaungsu (https://github.com/kaunghtetsan275/pyidaungsu)
* si: sinling (https://github.com/ysenarath/sinling)
* uz: fitrat (https://github.com/tahrirchi/fitrat)
* mr: MarathiNLP (https://github.com/l3cube-pune/MarathiNLP)
* bn: BNLP (https://github.com/sagorbrur/bnlp)
* th: Thai Segmenter (https://github.com/Querela/thai-segmenter)
* gu, hi, kn, ne, pa, te, ur: Indic NLP Library (https://github.com/anoopkunchukuttan/indic_nlp_library)
* zh, zh-Hant: pkuseg (https://github.com/explosion/spacy-pkuseg)
* he, iw: Hebrew Tokenizer (https://github.com/YontiLevin/Hebrew-Tokenizer)
* id: Kumparan's NLP Services (https://github.com/kumparan/nlp-id)
* bo: Botok (https://github.com/OpenPecha/Botok)
* others: NLTK word tokenizer, with fallback to en