Tokenizers used for each language:

* as, ca, cs, co, de, el, en, es, fi, fr, ga, hu, is, it, lt, lv, mni, nl, pl, pt, ro, ru, sk, sl, sv, ta: sacremoses (MosesTokenizer) (https://github.com/hplt-project/sacremoses)
* da, et, no, tr: NLTK word tokenizer (https://www.nltk.org/api/nltk.tokenize.html)
* sr, mk, bg, hr: Reldi (https://github.com/clarinsi/reldi-tokeniser)
* bs: Reldi, with fallback to sr
* ab, ba: sacremoses (MosesTokenizer), with fallback to ru
* af: sacremoses (MosesTokenizer), with fallback to nl
* ast,eu, gl: sacremoses (MosesTokenizer) with fallback to es
* br: sacremoses (MosesTokenizer), with fallback to fr
* co: sacremoses (MosesTokenizer), with fallback to it
* cy, eo, ga, la, lt, mt, so, sq, sw, tl: sacremoses  (MosesTokenizer) with fallback to en
* lb: sacremoses (MosesTokenizer) with fallback to de
* lvs: sacremoses (MosesTokenizer) with fallback to lv
* ja: MeCab (https://github.com/SamuraiT/mecab-python3)
* ko: MeCab-ko (https://github.com/NoUnique/pymecab-ko)
* my, shn: pyidaungsu (https://github.com/kaunghtetsan275/pyidaungsu)
* si: sinling (https://github.com/ysenarath/sinling)
* uz,  uzn: fitrat (https://github.com/tahrirchi/fitrat)
* mr: MarathiNLP (https://github.com/l3cube-pune/MarathiNLP)
* bn: BNLP (https://github.com/sagorbrur/bnlp)
* th: Thai Segmenter (https://github.com/Querela/thai-segmenter)
* awa, bho, gu, hi, hne, kn, ks, mag, mai, ml, mr, ne, npi, pa, sa, sat, te, ur: Indic NLP Library (https://github.com/anoopkunchukuttan/indic_nlp_library)
* zh, zh-Hant: pkuseg (https://github.com/explosion/spacy-pkuseg)
* he, iw, ydd: Hebrew Tokenizer (https://github.com/YontiLevin/Hebrew-Tokenizer)
* id: Kumparan's NLP Services (https://github.com/kumparan/nlp-id)
* ~~bo: Botok (https://github.com/OpenPecha/Botok)~~
* ~~ckb, kmr: KLPT (https://github.com/sinaahmadi/KurdishTokenization)~~
* yue: pyCantonese (https://github.com/jacksonllee/pycantonese)
* lo: LaoNLP (https://github.com/wannaphong/LaoNLP)
* ory: Open Odia (https://github.com/soumendrak/openodia)
* ig: Igbo Text (https://github.com/goodyduru/igbo-text)
* am, ti: ETNLTK (https://github.com/robeleq/etnltk/)
* nb, nn: NTLK word tokenizer, with fallback to no
* others (any not in the list above): NTLK word punct tokenizer (https://www.nltk.org/api/nltk.tokenize.punkt.html)  
