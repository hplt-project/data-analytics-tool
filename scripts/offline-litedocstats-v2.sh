L2=$1
L3=$2
zstdcat /work/uploaded_corpora/$L3*.jsonl.zst | python3.10 /work/scripts/readdocuments.py - /work/uploaded_corpora/HPLT-v2-"$L3".tsv /work/yaml_dir/HPLT-v2-"$L3".lite.yaml  \
$L2 --langs /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2  && \
cat /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2 | sort | uniq -c | sort -nr > /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2.langcounts &&\
python3.10 /work/scripts/readcorpus_mono.py /work/uploaded_corpora/HPLT-v2-"$L3".tsv /work/yaml_dir/HPLT-v2-"$L3".lite.yaml $L2 --lite --debug


