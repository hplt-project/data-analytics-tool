L2=$1
L3=$2


JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))


echo "Reading documents..."
zstdcat /work/uploaded_corpora/$L3*.jsonl.zst | python3.10 /work/scripts/readdocuments.py - /work/uploaded_corpora/HPLT-v2-"$L3".tsv /work/yaml_dir/HPLT-v2-"$L3".lite.yaml $L2 #--langs /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2 
date
echo "Running FastSpell..."
python3.10 /work/scripts/force-fasttext-download.py $L2
./scripts/parallel-fastspell.sh $JOBS $L2 /work/uploaded_corpora/HPLT-v2-"$L3".tsv /work/uploaded_corpora/HPLT-v2-"$L3".tsv.langids 1 
date
echo "Generating langcounts..."
cat /work/uploaded_corpora/HPLT-v2-"$L3".tsv.langids | sort --parallel $JOBS | uniq -c | sort -nr  >  /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2.langcounts
#        #nyapa
#        cp $saved_file_path.$srclang.langcounts $tsv_file_path.$srclang.langcounts      
source /work/venvs/venv-mc/bin/activate
date
echo "Running Monocleaner  Hardrules..."
cat /work/uploaded_corpora/HPLT-v2-$L3.tsv | /work/preprocess/build/bin/cache -k 1  parallel -k -j $JOBS --pipe monocleaner-hardrules --score_only --annotated_output --run_all_rules --disable_lang_ident  $L2 - - > /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2.hardrules 2> hr.log
deactivate
date
echo "Reading corpus..."
python3.10 /work/scripts/readcorpus_mono.py /work/uploaded_corpora/HPLT-v2-"$L3".tsv /work/yaml_dir/HPLT-v2-"$L3".lite.yaml $L2 --lite --debug
