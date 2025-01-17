GZFILE=$1
SRCLANG=$2
TRGLANG=$3


JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

if [[ $* == *--nocache* ]]
then
        NOCACHEFLAG="--nocache"
else
        NOCACHEFLAG=""
fi


# TO DO: BICLEANER MODEL STUFF HERE...

echo "Extracting TMX..."
dir_path=$(dirname "$GZFILE")
filename=$(basename "$GZFILE" .gz)
# Create the new file path with the "tmx" and "tsv" extension
TMXFILE="$dir_path/$filename"
TSVFILE="$dir_path/$filename.tsv"
YAMLFILE="yaml_dir/$filename.yaml"

zcat $GZFILE > $TMXFILE 
python3 ./tmxt/tmxt.py --codelist=$SRCLANG,$TRGLANG,$SRCLANG-source-document,$TRGLANG-source-document,collection,score-bicleaner  $TMXFILE $TSVFILE --multiprops

echo "Running FastSpell..."
date
python3.10 /work/scripts/force-fasttext-download.py $SRCLANG
python3.10 /work/scripts/force-fasttext-download.py $TRGLANG

./scripts/parallel-fastspell.sh $JOBS $SRCLANG $TSVFILE $TSVFILE.$SRCLANG.langids 1 $NOCACHEFLAG
./scripts/parallel-fastspell.sh $JOBS $TRGLANG $TSVFILE $TSVFILE.$TRGLANG.langids 2 $NOCACHEFLAG

echo "Generating langcounts..."
date
cat $TSVFILE.$SRCLANG.langids | sort --parallel $JOBS | uniq -c | sort -nr  >  $TSVFILE.$SRCLANG.langcounts
cat $TSVFILE.$TRGLANG.langids | sort --parallel $JOBS | uniq -c | sort -nr  >  $TSVFILE.$TRGLANG.langcounts

exit

echo "Reading corpus..."
date
python3.10 /work/scripts/readcorpus_mono.py /work/uploaded_corpora/fineweb2-"$L3".tsv /work/yaml_dir/fineweb2-"$L3".yaml $L2 --debug
python3 ./scripts/readcorpus.py $TSVFILE $YAMLFILE $SRCLANG $TRGLANG $METADATAFILE

rm -f $TSVFILE.$SRCLANG".ngrams"
rm -f $TSVFILE.$TRGLANG".ngrams"

for SUFFIX_ORDER in one_1 two_2 three_3 four_4 five_5
	do
        	SUFFIX=$(echo $SUFFIX_ORDER  | cut -d "_" -f 1)
                ORDER=$(echo $SUFFIX_ORDER | cut -d "_" -f 2)
		sort $TSVFILE.$SRCLANG.$SUFFIX --parallel $JOBS | uniq -c | sort -nr --parallel $JOBS | head -n 5 |   awk -v ORDER=$ORDER '{for (i=2; i<NF; i++) printf $i " "; print $NF"\t"$1"\t"ORDER}' >> $TSVFILE.$SRCLANG".ngrams"
                sort $TSVFILE.$TRGLANG.$SUFFIX --parallel $JOBS | uniq -c | sort -nr --parallel $JOBS | head -n 5 |   awk -v ORDER=$ORDER '{for (i=2; i<NF; i++) printf $i " "; print $NF"\t"$1"\t"ORDER}' >> $TSVFILE.$TRGLANG".ngrams"

        done
python3 ./scripts/addngrams.py $TSVFILE.$SRCLANG".ngrams"  $YAMLFILE "src"
python3 ./scripts/addngrams.py $TSVFILE.$TRGLANG".ngrams"  $YAMLFILE "trg"
