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
