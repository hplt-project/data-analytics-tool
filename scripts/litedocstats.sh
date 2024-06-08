L=$1
wget -i https://data.hplt-project.org/one/monotext/cleaned/$L"_map".txt && \
zstdcat $L"_"*.jsonl.zst | python3.10 /work/scripts/readdocuments.py - /work/uploaded_corpora/HPLT-docslite."$L".tsv /work/yaml_dir/HPLT-docslite."$L".yaml  $L && \
python3.10 /work/scripts/readcorpus_mono.py /work/uploaded_corpora/HPLT-docslite."$L".tsv /work/yaml_dir/HPLT-docslite."$L".yaml $L --lite

