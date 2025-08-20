# HPLT Analytics

This tool provides a full range of analytics automatically computed on either monolingual or bilingual data sets to help making informed decisions about them. 

It shows corpora details, volumes, language, length, noise and quality score distributions, common n-grams and others in the spirit of the work carried out by https://www.semanticscholar.org/paper/Documenting-the-English-Colossal-Clean-Crawled-Dodge-Sap/40c3327a6ddb0603b6892344509c7f428ab43d81. 

Support for language-dependent components has been added for dozens of languages. 

Automated reports are generated out of the tool, actioned from a web application to which a corpus can be uploaded. Once processed, the viewer will plot the analysis and automatically generate a PDF report containing the same information. 

Icon: https://thenounproject.com/icon/fingerprint-3530285/

## Running the docker:

* sudo docker-compose build
* sudo docker-compose up

URLs to upload and view a dataset: 
* Uploader: localhost:8000/uploader
* Viewer: localhost:8000/viewer

If you need to access docker to run stuff inside:
* sudo docker exec -it dat-webapp /bin/bash

Code and data are located in `/work`. Yaml files served in the frontend must be placed in `/work/yaml_dir/`. In order to check that everything is working seamlessly, there are some tests scripts located in `/work/tests/` that you can run.

## Generating stats

### General case: runstats.sh

Aside from uploading from the webapp interface, the `runstats.sh` (located in  `/work/scripts/`) can be used for generating stats, running it with parameters as follows:
```
bash /work/scripts/runstats.sh {CORPUS_PATH} {YAML_FILENAME} {SOURCE_LANGUAGE} {TARGET_LANGUAGE} {FORMAT} {LANGUAGE_FORMAT} {--no-cache} {--no-register-labels} {--no-domain-labels} {--debug}
```
Being:
* CORPUS_PATH: The path to the corpus to be analyzed.
* YAML_FILENAME: The path and filename the resulting stats yaml will have.
* SOURCE_LANGUAGE: Source language code (2-letters, ISO 639-1)
* TARGET_LANGUAGE: Target language code (2-letters, ISO 639-1), or `-` for monolingual.
* FORMAT: File format. Currently accepted values are `bitext`, `tmx`, `tsv`, `hplt`, `nemotron` and  `fineweb`. The last 3 are intender for full documents, in [HPLT v2](https://hplt-project.org/datasets/v2.0), [NemotronCC](https://data.commoncrawl.org/contrib/Nemotron/Nemotron-CC/index.html) or [FineWeb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2) formats (jsonl with different key names).
* LANGUAGE_FORMAT: Currently accepted values are `parallel` and `mono`.

With the optional flags being:
* `--no-register-labels`: Avoids obtaining Register Labels, that is a slow part of the pipeline. Recommended for large corpora or when not running on CPU.
* `--no-domain-labels`: Skips domain classification, reducing runtime.
* `--no-cache`: Avoids using [cache](https://github.com/kpu/preprocess). Use this flag for very large corpora, when you consider that your unique segments (non-duplicates) won't fit in memory. This will make some parts of the pipeline slower, but it will still be able to run. This flag alone does not skip any feature.
* `--debug`: Don't remove the workdir after finishing the run ('/work/transient/XXXXXX/`)

The first two flags affect to the performance of the pipeline. You probably want to start with `--no-register-labels` and then add `--no-cache` if needed.

### Domain labels configuration

Domain labels use `nvidia/multilingual-domain-classifier` ([HF model card](https://huggingface.co/nvidia/multilingual-domain-classifier)). Configuration via environment variables (read by `runstats.sh` and forwarded to the classifier):

- `DOMAIN_TOPK` (int, default `3`): number of top labels per document to count. Note that with `topk > 1`, a single document can contribute to multiple domain bins, so the sum of counts in `domain_labels` can exceed the number of documents.
- `DOMAIN_MINCONF` (float, default `0.5`): minimum softmax confidence; if none exceed this threshold for a document, the document is counted as `UNK`.
- `DOMAIN_REVISION` (string, optional): model revision pin for reproducibility (applies to both model and tokenizer). It is recommended to pin a specific revision in production to avoid upstream changes affecting results.
- `DOMAIN_LANGS` (string, optional): space-separated allowlist of language codes for running domain classification. Defaults to the 52 languages supported by the model.

Alternatively, you can pass the equivalent flags directly to the classifier if you run it standalone: `--topk`, `--minconf`, `--revision`. CLI flags take precedence over environment variables when provided.

The generated stats YAML includes a `domain_labels_meta` field with minimal metadata: `model_id`, `revision`, `topk`, `minconf` used for the run.


### Other scripts

Within the `scripts/` folder there are other scripts that can build stats in other specific cases:
* `offline-docstats-v2.sh`: Generates stats for a [HPLT v2](https://hplt-project.org/datasets/v2.) monolingual dataset that must be already located in `/work/uploaded_corpora/` in `.jsonl.zst` format. It takes two positional arguments, the language code (i.e. `en`) and the identifier of the  dataset (i.e. `eng_Latn`). Optionally (for large datasets that do not fit in memory) , the `--nocache` flag can be used.
* `hplt2-parallel.sh`: Generates stats for parallel [HPLT v2](https://hplt-project.org/datasets/v2.0) datasets. Positional parameters are the path to the dataset in TMX format (compressed), the source language and the target language. Optionally (for large datasets that do not fit in memory) , the `--nocache` flag can be used.
* `fineweb2-docstats.sh` : Generates stats for [FineWeb2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2), streaming the data from  HuggingFace. Positional parameters are language code (i.e. `en`) and FineWeb2 subset (i.e. `eng_Latn`).  Optionally (for large datasets that do not fit in memory) , the `--nocache` flag can be used.

## Current info in the generated yaml files: 

The stats generated with this tool come in a handy yaml format with the following fields:

- `bicleaner_scores`: Distribution of segments pairs with certain [Bicleaner AI](https://github.com/bitextor/bicleaner-ai) scores (only for parallel corpora)
- `corpus`: Corpus filename
- `docs_collections`: Distribution of documents per origin collection (only for monoligual documents and HPT parallel datasets)
- `collections`: Distribution of segments per origin collection (only for HPLT parallel datasets)
- `docs_langs`: Distribution of documents having a certain percentage of its segments in the declared document language (only for monolingual documents)
- `docs_segments`: Distribution of documents having a certain amount of segments (only for monolingual documents)
- `docs_segments_mean`: Mean value of `docs_segments` (only for monolingual documents)
- `docs_segments_median`: Median value of `docs_segments` (only for monolingual documents)
- `docs_timestamp`: Unix timestamp indicating when were the documents part of the stats obtained (only for monolingual documents)
- `docs_top100_domains`: 100 most common domains, and the amount of documents for each one (only for monolingual documents)
- `docs_top100_tld`: 100 most common top level domains (not including subdomains), and the amount of document for each one (only for monolingual documents)
- `docs_total`: Total amount of documents in the corpus (only for monolingual documents)
- `docs_warning`: List of issues encountered while processing documents (only for monolingual documents)
  - `docs_unmatching_xxx`: Some documents (a total of xxx) in the corpus had a different amount of segments and LM scores or language identification, so they were discarded.
- `docs_wds`: Distribution of documents having a certain [Document Score](https://github.com/pablop16n/web-docs-scorer/) (only for monolingual documents)
- `hardrules_tags`: List of possible issues in the segments, detected by [Hardrules](https://github.com/bitextor/bicleaner-hardrules)
  -  `not_too_long`: Percentage of segments being larger than 1024 characters.
  -  `not_too_short`: Percentage of segments being shorter than 3 tokens.
  -  `no_urls`: Percentage of segments containing URLs.
  -  `no_bad_encoding`: Percentage of bad encoded segments.
  -  `no_porn`: Percentage of segments having porn content (not available for all languages)
- `monocleaner_scores`: Distribution of segments with a certain [Monocleaner](https://github.com/bitextor/monocleaner) score (only for monolingual corpora)
- `register_labels`: Distribution of documents identified with a given web register by [web-register-classification-multilingual](https://huggingface.co/TurkuNLP/web-register-classification-multilingual) (only for monolingual documents)
- `domain_labels`: Distribution of documents across model-defined domains by [nvidia/multilingual-domain-classifier](https://huggingface.co/nvidia/multilingual-domain-classifier) (only for monolingual documents)
- `sentence_pairs`: Total amount of segments (in the case of monolingual corpora) or segment pairs (in the case of parallel corpora)
- `src_bytes`: Total size of source segments, uncompressed.
- `src_chars`: Total amount of characters in source segments.
- `src_pii`: Number of source segments containing potential personally identifiable information.
- `srclang`: Source language.
- `src_langs`: Distribution of source segments languages, as identified by [FastSpell](https://github.com/mbanon/fastspell)
- `src_ngrams`: Distribution of the 5 most common n-grams of each order (1-grams to 5-grams) in source segments
- `src_sent_tokens`: Distribution of source segments having a certain amount of tokens (more info on tokenization tools [here](tokenizers-info.md))
- `src_sent_tokens_mean`: Mean value of `src_sent_tokens`
- `src_sent_tokens_median`: Median value of `src_sent_tokens` 
- `src_tokens`: Total amount of tokens in source segments 
- `src_top100_domains`: 100 most common domains in source segments, and the amount of segments for each one (only for HPLT parallel corpora)
- `src_top100_tld`: 100 most common top level domains in source segments (not including subdomains), and the amount of segments for each one (only for HPLT parallel corpora)
- `src_unique_sents`: Distribution of source segments having a certain amount of tokens, after removing duplicated segments 
- `timestamp`: Unix timestamp indicating when were the stats obtained.
- `trg_bytes`: Total size of target segments, uncompressed (only for parallel corpora)
- `trg_chars`: Total amount of characters in target segments (only for parallel corpora)
- `trg_pii`: Number of target segments containing potential personally identifiable information (only for parallel corpora)
- `trglang`: Target language (only for parallel corpora)
- `trg_langs`: Distribution of target segments languages, as identified by [FastSpell](https://github.com/mbanon/fastspell) (only for parallel corpora)
- `trg_ngrams`:  Distribution of the 5 most common n-grams of each order (1-grams to 5-grams) in target segments (only for parallel corpora)
- `trg_sent_tokens`: Distribution of target segments having a certain amount of tokens (more info on tokenization tools [here](tokenizers-info.md)) (only for parallel corpora)
- `trg_sent_tokens_mean`: Mean value of `trg_sent_tokens` (only for parallel corpora)
- `trg_sent_tokens_median`: Median value of `trg_sent_tokens` (only for parallel corpora)
- `trg_tokens`: Total amount of tokens in target segments (only for parallel corpora)
- `trg_top100_domains`: 100 most common domains in target segments, and the amount of segments for each one (only for HPLT parallel corpora)
- `trg_top100_tld`: 100 most common top level domains in target segments (not including subdomains), and the amount of segments for each one (only for HPLT parallel corpora)
- `trg_unique_sents`: Distribution of target segments having a certain amount of tokens, after removing duplicated segments (only for parallel corpora)
- `unique_sents`: Total amount of segments (for monolingual corpora) or segment pairs (for parallel corpora), after removing duplicated segments or segment pairs
- `duplication_ratio`: Portion of segments that were identified as duplicates, computed as duplicates divided by total segments
- `sample`: JSON array with up to 50 example documents, segments or segment pairs from the corpus
- `warnings`: List of issues encountered while processing the corpus.
  - `src_warning_tok_xxx_yyy`: The source language is not supported by a dedicated tokenizer, so it fallbacks to the xxx tokenizer with the yyy language (only for parallel corpora).
  - `trg_warning_tok_xxx_yyy`: Same as the above but for the target language (only for parallel corpora).
  - `ngrams_xxx_nostopwords`: No stopwords available for the xxx language (the language being processed)
  - `ngrams_xxx_freq`: The stopwords used for the xxx language were simply obtained by frequency (top 1% of the corpus)
  - `src_fastspell`: The source language is not supported by FastSpell.
  - `trg_fastspell`: The target language is not supported by FastSpell (only for parallel corpora).

## Viewer : 

HPLTAnalytics comes with a webapp that is able to display the generated yaml files in a friendlier, more confortable interface. It has the following sections:

- General overview:
  - Corpus name
  - Date on which the analysis was performed
  - Language(s)  
- Volumes
  - Documents (only for monolingual documents)
  - Segments
  - Unique segments (only for monolingual)
  - Size in tokens, of source (monolingual), or source and target (parallel)
  - Size in characters, of source (monolingual), or source and target (parallel)
  - File size, of source (monolingual), or source and target (parallel)
  - Top domains (excluding subdomains) (when available), showing up to the top 10 with remaining grouped as "Other", of source (monolingual), or source and target (parallel)
  - Top 10 TLDs (when available), of source (monolingual), or source and target (parallel)
- Document size (in segments). Histogram showing the distribution of document sizes (only for monolingual documents)
- Translation likelihood: Histogram showing the distribution of sentence pairs having a certain bicleaner score (tool that computes the likelihood of two sentences of being mutual translations) (only for parallel corpora)
- Collections (parallel) / Documents by collection (monolingual) (when available)
- Language distribution.
    - Number of segments: Shows percentage of automatically identified languages in source (monolingual) or source and target (parallel).
    - Percentage of segments in the declared languge, inside documents (only for monolingual documents)
- Document Score distribution: Histogram showing the distribution of Document Score (only for monolingual documents)
- Segment length distribution: Histogram showing the distribution of tokens per segment in source (monolingual) or source and target (parallel), showing total, unique and duplicate segments or segment pairs
- Noise distribution: the result of applying hard rules and computing which percentage is affected by them (too short or too long sentences, sentences being URLs, bad encoding, sentences containing poor language, etc.).
- Frequent n-grams: 1-5 more frequent n-grams

### Exporting the report to PDF

Use the **Export to PDF** button at the bottom of the viewer to generate a PDF containing all charts displayed on the page, including register and domain labels when available.

We also display samples for some of the datasets. These are currently obtained out of the HPLTAnalytics tool and all the storage and the logic of which sample/labels must be displayed is currently happening in Javascript. Further versions of HPLTAnalytics will properly handle this.

# Output examples: 

- HPLT monolingual documents for Afrikaans: it shows that more than a half of the documents come from the same domain, and that a large amount of documents contain less than a 30% of segments in Afrikaans. It also contains a lot of short segments. The general low quality of this corpus is confirmed also by its Document Scores.

<img alt="Data Analytics Viewer" src="https://github.com/hplt-project/data-analytics-tool/blob/main/img/HPLT-af.png" width=600 />

- Parallel English-Norwegian HPLT corpus from initial data release: it shows that deduplication needs to be addressed as one of the most important issues.

<img alt="Data Analytics Viewer" src="https://github.com/hplt-project/data-analytics-tool/blob/main/img/HPLT-en-nn.png" width=600 />
  
- Monolingual Basque corpus from HPLT: it shows that at least half of the corpus is not in Basque, and that a very high percentage of segments are very short.

<img alt="Data Analytics Viewer" src="https://github.com/hplt-project/data-analytics-tool/blob/main/img/HPLT-eu.png" width=600 />
