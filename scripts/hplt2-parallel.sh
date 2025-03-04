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

#all language are paired with EN in this release
bicleaner_ai_langs_en=(ar bg ca cs da de el es et eu fi fr ga gl hbs he hi hu is it ja lt lv mk mt nb nl nn pl pt ro sk sl sq sv sw tr uk vi zh sr bs hr me)
hbs_langs=(hr sr bs me)

if [[ " ${bicleaner_ai_langs_en[*]} " =~ " $TRGLANG " ]]; then
	#en-trg not supported by classic bicleaner
	if [[ " ${hbs_langs[*]} " =~ " $TRGLANG " ]]; then
		bc_srclang=$SRCLANG
		bc_trglang=hbs
		bicleaner_ai_metadata=$datapath/bicleaner-ai/$SRCLANG-$bc_trglang/metadata.yaml
	else
		bc_srclang=$SRCLANG
   		bc_trglang=$TRGLANG
   		bicleaner_ai_metadata=$datapath/bicleaner-ai/$SRCLANG-$TRGLANG/metadata.yaml   				
   	fi
else
	#en-trg not supported by bicleaner ai, but falling back to en-xx
	echo "Falling back to bicleaner-ai en-xx"
	bicleaner_ai_metadata=$datapath/bicleaner-ai/en-xx/metadata.yaml
   	bc_srclang=$SRCLANG
   	bc_trglang=xx
fi

#Download models
if [ -f "$bicleaner_ai_metadata" ]; then
	echo "BicleanerAI model already downloaded."
else
       	mkdir -p $datapath/bicleaner-ai
      	echo "Downloading bicleanerAI model..."
        mkdir -p $datapath/bicleaner-ai/$bc_srclang-$bc_trglang
        source /work/venvs/venv-bcai/bin/activate
        bicleaner-ai-download $bc_srclang $bc_trglang full $datapath/bicleaner-ai/$bc_srclang-$bc_trglang/
        deactivate
fi

echo "Extracting TMX..."
dir_path=$(dirname "$GZFILE")
filename=$(basename "$GZFILE" .gz)
# Create the new file path with the "tmx" and "tsv" extension
TMXFILE="$dir_path/$filename"
TSVFILE="$dir_path/$filename.tsv"
HRFILE="$dir_path/$filename.hardrules"
YAMLFILE="yaml_dir/$filename.yaml"

zcat $GZFILE > $TMXFILE 
python3 ./tmxt/tmxt.py --codelist=$SRCLANG,$TRGLANG,$SRCLANG-source-document,$TRGLANG-source-document,collection,score-bicleaner  $TMXFILE $TSVFILE --multiprops

echo "Running Hardrules..."
date
source /work/venvs/venv-bhr/bin/activate
cat $TSVFILE | /work/preprocess/build/bin/cache -k 1,2 bicleaner-hardrules --score_only --annotated_output --disable_lang_ident --run_all_rules -p $JOBS -s $bc_srclang -t $bc_trglang - - --metadata $bicleaner_ai_metadata > $HRFILE
deactivate


echo "Running FastSpell..."
date
python3.10 /work/scripts/force-fasttext-download.py $SRCLANG
python3.10 /work/scripts/force-fasttext-download.py $TRGLANG

./scripts/parallel-fastspell.sh $JOBS $SRCLANG $TSVFILE $TSVFILE.$SRCLANG.langids 1 $NOCACHEFLAG
./scripts/parallel-fastspell.sh $JOBS $TRGLANG $TSVFILE $TSVFILE.$TRGLANG.langids 2 $NOCACHEFLAG

echo "Generating langcounts..."
date
cat $TSVFILE.$SRCLANG.langids | sort --parallel $JOBS | uniq -c | sort -nr  >  $TMXFILE.$SRCLANG.langcounts
cat $TSVFILE.$TRGLANG.langids | sort --parallel $JOBS | uniq -c | sort -nr  >  $TMXFILE.$TRGLANG.langcounts

echo "Reading corpus..."
date

if [ "$SRCLANG" = "bn" ]  || [ "$SRCLANG" = "ben" ] || [ "$TRGLANG" = "bn" ] || [ "$TRGLANG" = "ben" ]; then
	source /work/venvs/venv-bnlp/bin/activate	
fi

python3 ./scripts/readcorpus_hpltv2.py $TSVFILE $YAMLFILE $SRCLANG $TRGLANG $METADATAFILE

if [ "$SRCLANG" = "bn" ]  || [ "$SRCLANG" = "ben" ] || [ "$TRGLANG" = "bn" ] || [ "$TRGLANG" = "ben" ]; then
	deactivate
fi





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
