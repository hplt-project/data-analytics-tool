L2=$1
L3=$2
FILENAME=$3


JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

if [[ $* == *--nocache* ]]
then
        NOCACHEFLAG="--nocache"
else
        NOCACHEFLAG=""
fi


echo "Reading documents..."
source /work/venvs/venv-hf/bin/activate
python3.10 /work/scripts/readdocuments-plaindocs.py text /work/uploaded_corpora/$FILENAME /work/uploaded_corpora/$FILENAME.tsv /work/yaml_dir/$FILENAME.yaml $L3 #--langs /work/uploaded_corpora/HPLT-v2-$L3.tsv.$L2 
deactivate


echo "Register labels..."
source /work/venvs/venv-rl/bin/activate
cat /work/uploaded_corpora/$FILENAME | python3 ./scripts/registerlabels.py  > /work/uploaded_corpora/$FILENAME.rl
deactivate
cat /work/uploaded_corpora/$FILENAME.rl | sort --parallel $JOBS | uniq -c | sort -nr  > /work/uploaded_corpora/$FILENAME.tsv.rlcounts

echo "Running FastSpell..."
python3.10 /work/scripts/force-fasttext-download.py $L2
./scripts/parallel-fastspell.sh $JOBS $L2 /work/uploaded_corpora/$FILENAME.tsv /work/uploaded_corpora/$FILENAME.tsv.langids 1 $NOCACHEFLAG

echo "Generating langcounts..."
cat /work/uploaded_corpora/$FILENAME.tsv.langids | sort --parallel $JOBS | uniq -c | sort -nr  >  /work/uploaded_corpora/$FILENAME.tsv.$L2.langcounts

source /work/venvs/venv-mc/bin/activate
echo "Running Monocleaner  Hardrules..."
if [[ $* == *--nocache* ]]
then
        cat /work/uploaded_corpora/$FILENAME.tsv | parallel -k -j $JOBS --pipe monocleaner-hardrules --score_only --annotated_output --run_all_rules --disable_lang_ident  $L2 - - > /work/uploaded_corpora/$FILENAME.tsv.$L2.hardrules 2> hr.log
else
        cat /work/uploaded_corpora/$FILENAME.tsv | /work/preprocess/build/bin/cache -k 1  parallel -k -j $JOBS --pipe monocleaner-hardrules --score_only --annotated_output --run_all_rules --disable_lang_ident  $L2 - - > /work/uploaded_corpora/$FILENAME.tsv.$L2.hardrules 2> hr.log

fi
deactivate

echo "Reading corpus..."
python3.10 /work/scripts/readcorpus_mono.py /work/uploaded_corpora/$FILENAME.tsv /work/yaml_dir/$FILENAME.yaml $L2 --debug

rm -f  uploaded_corpora/$FILENAME.tsv.ngrams

for SUFFIX_ORDER in one_1 two_2 three_3 four_4 five_5
	do
        	SUFFIX=$(echo $SUFFIX_ORDER  | cut -d "_" -f 1)
                ORDER=$(echo $SUFFIX_ORDER | cut -d "_" -f 2)
                sort uploaded_corpora/$FILENAME.tsv.$SUFFIX --parallel $JOBS | uniq -c | sort -nr --parallel $JOBS | head -n 5 |   awk -v ORDER=$ORDER '{for (i=2; i<NF; i++) printf $i " "; print $NF"\t"$1"\t"ORDER}' >> uploaded_corpora/$FILENAME.tsv.ngrams
        done
python3 ./scripts/addngrams.py uploaded_corpora/$FILENAME.tsv.ngrams  /work/yaml_dir/$FILENAME.yaml  src