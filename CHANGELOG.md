v1.3:
- Removed language codes from interface, only language names are shown now.

v1.2:
- Support for  HPLTv3 documents.
- Support for 3 letter language codes (but 2-letter codes are still adviced if possible)
- New feature : Domain labels (https://huggingface.co/nvidia/multilingual-domain-classifier)
- Register Labels are reused when they already exist in the dataset (only for HPLT v3 documents)
- Minor interface enhancements.
- Bump requeriments.

v1.1:
- Sample extraction is now integrated in stats processing, and samples now are included in resulting yaml files.
- Added support for Fineweb, Nemotron-CC and MADLAD datasets.
- Empty segments are now skipped.
- Web uploader now supports binary files.
- Added `duplication-ratio`
- Added interface-only version (Dockerfile-lightweb).
- Interface performance & visuals enhancements.
- Bump requeriments.


v1.0:
- Multithread-friendly readcorpus/readcorpusmono/readdocuments scripts
- Processing now happens in transient dirs (different paths for different runs)
- Updated tests
- Batched GPU processing for register labels
- Lite stats are now deprecated


v0.2-ALPHA:

* Support for more languages
* Support for HPLT document format
* New interface
* Added documentation
* Performance improvements
	* GPU support
	* ngrams extraction using files instead of memory 
	* Cached and parallel processing of hardrules and mono/bicleaner classic/AI
* Extended stopwords
* Fix issue with Fastspell download
* Webapp interface enhancements 
