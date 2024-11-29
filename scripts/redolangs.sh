L2=$1
L3=$2


JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))


#create backup of the existing yaml just in case
cp /work/yaml_dir/HPLT-v2-"$L3".yaml  /work/yaml_dir/HPLT-v2-"$L3".yaml.backup

echo "Extracting documents..."
zstdcat /work/uploaded_corpora/$L3*.jsonl.zst | python3.10 /work/scripts/readdocuments.py - /work/uploaded_corpora/HPLT-v2-"$L3".tsv /work/yaml_dir/dummy.$L3.yaml  $L2 #--langs /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2 

echo "Running FastSpell..."
python3.10 /work/scripts/force-fasttext-download.py $L2
./scripts/parallel-fastspell.sh $JOBS $L2 /work/uploaded_corpora/HPLT-v2-"$L3".tsv /work/uploaded_corpora/HPLT-v2-"$L3".tsv.langids 1 

date
echo "Generating langcounts..."
cat /work/uploaded_corpora/HPLT-v2-"$L3".tsv.langids | sort --parallel $JOBS | uniq -c | sort -nr  >  /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2.langcounts

echo "Writing to Yaml"
cat /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2.langcounts | python3.10 /work/scripts/others/update-langcounts.py /work/yaml_dir/HPLT-v2-"$L3".yaml
















