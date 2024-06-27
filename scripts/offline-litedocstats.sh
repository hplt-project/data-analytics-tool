L=$1
zstdcat $L"_"*.jsonl.zst | python3.10 /work/scripts/readdocuments.py - /work/uploaded_corpora/HPLT-docslite."$L".tsv /work/yaml_dir/HPLT-docslite."$L".yaml  \
$L --langs /work/uploaded_corpora/HPLT-docslite.$L.tsv.$L --fluency /work/uploaded_corpora/HPLT-docslite."$L".tsv.classify  && \
cat /work/uploaded_corpora/HPLT-docslite.$L.tsv.$L | sort | uniq -c | sort -nr > /work/uploaded_corpora/HPLT-docslite.$L.tsv.$L.langcounts &&\
python3.10 /work/scripts/readcorpus_mono.py /work/uploaded_corpora/HPLT-docslite."$L".tsv /work/yaml_dir/HPLT-docslite."$L".yaml $L --lite --debug

