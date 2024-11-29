L2=$1 #langcode
TEXTFILE=$2 


JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

if [[ $* == *--nocache* ]]
then
        NOCACHEFLAG="--nocache"
else
        NOCACHEFLAG=""
fi


echo "Extracting documents..."
zstdcat $TEXTFILE | python3.10 /work/scripts/readdocuments.py - $TEXTFILE.tsv /dev/null  $L2

echo "Running Hardrules..."

source /work/venvs/venv-mc/bin/activate
echo "Running Monocleaner  Hardrules..."
if [[ $* == *--nocache* ]]
then
        cat $TEXTFILE.tsv | parallel -k -j $JOBS --pipe monocleaner-hardrules --score_only --annotated_output --run_all_rules --disable_lang_ident  $L2 - - > $TEXTFILE.hardrules 2> hr.log
else
        cat $TEXTFILE.tsv | /work/preprocess/build/bin/cache -k 1  parallel -k -j $JOBS --pipe monocleaner-hardrules --score_only --annotated_output --run_all_rules --disable_lang_ident  $L2 - - > $TEXTFILE.hardrules  2> hr.log
fi
deactivate

python3.10 /work/scripts/get_hardrules_counts.py $TEXTFILE $L2