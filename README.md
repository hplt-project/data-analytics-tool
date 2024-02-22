# HPLT Analytics

This tool provides a full range of analytics automatically computed on either monolingual or bilingual data sets to help making informed decisions about them. 

It shows corpora details, volumes, language, length, noise and quality score distributions, common n-grams and others in the spirit of the work carried out by https://www.semanticscholar.org/paper/Documenting-the-English-Colossal-Clean-Crawled-Dodge-Sap/40c3327a6ddb0603b6892344509c7f428ab43d81. 

Support for language-dependent components has been added for dozens of languages. 

Automated reports generated out of the tool that is actioned from a web application to which a corpus can be uploaded. Once processed, the viewer will plot the analysis and automatically generate a PDF report containing the same information. 

<img alt="Data Analytics Viewer" src="https://github.com/lukasweymann/data-analytics-tool/blob/main/img/bilingual.png" width=600 />

Icon: https://thenounproject.com/icon/fingerprint-3530285/

Running the docker:

* sudo docker-compose build
* sudo docker-compose up


URLS to upload and view a dataset: 
* Uploader: localhost:8000/uploader.html
* Viewer: localhost:8000/viewer.html

If you need to access docker to run stuff inside:
* sudo docker exec -it dat-webapp /bin/bash

Code and data are located in `/work`


# Current info: 

- Corpus: name, language(s), date on which the analysis was performed
- Volumes: sentences, unique sentences, size in tokens, file size
- Type Token Ratio: lexical variation indicator. The ratio is obtained by dividing the total number of different words (called types) by the total number of words (called tokens). The higher, the better as high TTR indicates a high degree of lexical variation while low TTR indicates the opposite. 
- Sentence length distribution: tokens per sentence for each language, showing total, unique and duplicate sentences.
- Language distribution: shows percentage of automatically identified languages.
- Quality Score distribution: as per language models (monolingual) or bicleaner scores (tool that computes the likelihood of two sentences of being mutual translations)
- Noise distribution: the result of applying hard rules and computing which percentage is affected by them (too short or too long sentences, sentences being URLs, bad encoding, sentences containing poor language, etc.)
- Common n-grams: 1-5 more frequent n-grams

- MORE TO BE ADDED, SUGGESTIONS WELCOME!

# Output examples: 

- Parallel English-Norwegian HPLT corpus from initial data release: it shows that deduplication needs to be addressed as one of the most important issues.

<img alt="Data Analytics Viewer" src="https://github.com/lukasweymann/data-analytics-tool/blob/main/img/monolingual.png" width=600 />

  
- Monolingual Turkish corpus from Bianet: it shows that at least a 12% of the corpus is not in Turkish.

<img alt="Data Analytics Viewer" src="https://github.com/hplt-project/data-analytics-tool/blob/main/img/bianet.tr.png" width=600 />
