
cd /work/uploaded_corpora/
wget https://data.commoncrawl.org/contrib/Nemotron/Nemotron-CC/data-jsonl/quality=high/kind=actual/kind2=actual/CC-MAIN-2023-14-part-00036.jsonl.zstd -O nemotron-sample.jsonl.zstd
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/nemotron-sample.jsonl.zstd  yaml_dir/test.mono-nemotron.yaml en - nemotron mono
rm uploaded_corpora/nemotron*
