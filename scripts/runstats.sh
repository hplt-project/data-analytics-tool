#!/bin/bash

# Store the command line arguments in variables
saved_file_path=$1
yaml_file_path=$2
srclang=$3
trglang=$4
format=$5
langformat=$6

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

JOBS_READCORPUS=$(($JOBS/3*2))

GPU_BATCHSIZE=256
GPU_BATCHSIZE_DL=64

export PYTORCH_CUDA_ALLOC_CONF=${PYTORCH_CUDA_ALLOC_CONF:-expandable_segments:True}

if [[ $* == *--no-cache* ]]
then
        PARALLEL_CACHE_CMD=""
        MONO_CACHE_CMD=""
else
        PARALLEL_CACHE_CMD="/work/preprocess/build/bin/cache -k 1,2 "
	MONO_CACHE_CMD="/work/preprocess/build/bin/cache -k 1 "        
fi


if [[ $* == *--skip-register-labels* ]]
then
        SKIPRLFLAG=true
else
        SKIPRLFLAG=false
fi

if [[ $* == *--skip-domain-labels* ]] 
then
        SKIPDLFLAG=true
else
        SKIPDLFLAG=false
fi

if [[ $* == *--debug* ]]
then
        DEBUGFLAG=true
else
        DEBUGFLAG=false
fi


if [ "$format" = "hplt2" ] || [ "$format" = "hplt3" ] || [ "$format" = "nemotron" ] || [ "$format" = "fineweb" ] || [ "$format" = "madlad" ]; then
	DOCS=true
else
	DOCS=false
fi

if ! [ -x "$(command -v nvidia-smi)" ]; then
	echo 'Warning: No GPUs detected..' >&2
	GPUS=0
else
	GPUS=$(nvidia-smi --list-gpus | wc -l)
	echo "$GPUS GPUs detected"
fi


#bicleaner_langs_en=(bg ca cs da de el es et fi fr ga hr hu is it lt lv mt nb nl nn pl pt ro ru sk sl sv uk)
bicleaner_langs_es=(ca de gl eu)

bicleaner_ai_langs_en=(ar bg ca cs da de el es et eu fi fr ga gl hbs he hi hu is it ja lt lv mk mt nb nl nn pl pt ro sk sl sq sv sw tr uk vi zh sr bs hr me)
bicleaner_ai_langs_es=(ca de gl eu zh)

monocleaner_langs=(ab af am ar as  az ba be bg bh bn bo br bs ca ceb chr cnr co cs cy da de dv dz el en eo es et eu fa fi fr ga gl gu hbs he hi hr hu hy id \
	is it ja ka kk kn ko ky la lt lt lv mk ml mn mr ms mt my nb ne nl nn pa pl ps pt ro ru si sk sl so sq sr sv sw ta te th tl tr tt uk ur uz vi zh)

hbs_langs=(hr sr bs me)


registerlabels_langs=(af sq am ar hy as az eu be bn bs br bg my ca zh hr cs da nl en eo et tl fi fr gl ka de el gu ha he hi hu is id ga it ja jv \
	kn kk km ko ku ky lo la lv lt mk mg ms ml mr mn ne no nn nb or om ps fa pl pt pa ro ru sa gd sr sd si sk sl so es su sw sv ta te th tr uk ur ug uz vi cy fy xh yi)

# NVIDIA multilingual-domain-classifier allowlist (52 languages)
domainlabels_langs=(ar az bg bn ca cs da de el es et fa fi fr gl he hi hr hu hy id is it ka kk kn ko lt lv mk ml mr ne nl no pl pt ro ru sk sl sq sr sv ta tr uk ur vi ja zh)


mkdir -p $datapath
mkdir -p /work/transient
mkdir -p /work/transient/tmp
workdir=$(mktemp -d /work/transient/XXXXXX)
TMPDIR=/work/transient/tmp
#filename=$(basename "$saved_file_path")
echo WORKDIR:  $workdir

# Check if its monolingual or bilingual corpus
if [ "$langformat" == "parallel" ]; then    
	if [ "$srclang" == "en" ]; then
    		if [[ " ${bicleaner_langs_en[*]} " =~ " $trglang " ]]; then
			#en-trg is supported by classic bicleaner
			bicleaner_metadata=$datapath/bicleaner/$srclang-$trglang/$srclang-$trglang.yaml    	
			bc_srclang=$srclang
			bc_trglang=$trglang
   		else
			#en-trg not supported by classic bicleaner
	   		if [[ " ${bicleaner_ai_langs_en[*]} " =~ " $trglang " ]]; then
   				#en-trg is supported by bicleaner ai

   				if [[ " ${hbs_langs[*]} " =~ " $trglang " ]]; then
					bc_srclang=$srclang
					bc_trglang=hbs
					bicleaner_ai_metadata=$datapath/bicleaner-ai/$srclang-$bc_trglang/metadata.yaml
				else
	  				bc_srclang=$srclang
   					bc_trglang=$trglang
   					bicleaner_ai_metadata=$datapath/bicleaner-ai/$srclang-$trglang/metadata.yaml   				
   				fi
	   		else
   				#en-trg not supported by bicleaner ai, but falling back to en-xx
   				echo "Falling back to bicleaner-ai en-xx"
   				bicleaner_ai_metadata=$datapath/bicleaner-ai/en-xx/metadata.yaml
   				bc_srclang=$srclang
   				bc_trglang=xx
	   		fi
   		fi
	elif [ "$srclang" == "es" ] ; then
    		if [[ " ${bicleaner_langs_es[*]} " =~ " $trglang " ]]; then
        		#es-trg is supported by classic bicleaner
	                bicleaner_metadata=$datapath/bicleaner/$srclang-$trglang/$srclang-$trglang.yaml
	                bc_srclang=$srclang
	                bc_trglang=$trglang
	        elif [ "$trglang" == "en" ] ; then
	        	#special es-en case
	        	bicleaner_metadata=$datapath/bicleaner/$trglang-$srclang/$trglang-$srclang.yaml
                        bc_srclang=$trglang
                        bc_trglang=$srclang
                        is_reversed=true
	        else
        		#es-trg not supported by classic bicleaner
            		if [[ " ${bicleaner_ai_langs_es[*]} " =~ " $trglang " ]]; then
                        	#es-trg is supported by bicleaner ai
	                        bicleaner_ai_metadata=$datapath/bicleaner-ai/$srclang-$trglang/metadata.yaml
	                        bc_srclang=$srclang
	                        bc_trglang=$trglang
        	        else
                	        #es-trg not supported by  any bicleaner
				echo "Unsupported language pair in Bicleaner/BicleanerAI"
	                fi
		fi    
	#REVERSED PAIRS
	elif [ "$trglang" == "en" ]; then
                if [[ " ${bicleaner_langs_en[*]} " =~ " $srclang " ]]; then
                        #en-src is supported by classic bicleaner
                        is_reversed=true
                        bc_srclang=$trglang
                        bc_trglang=$srclang
                        bicleaner_metadata=$datapath/bicleaner/$trglang-$srclang/$trglang-$srclang.yaml
                else
                        #en-src not supported by classic bicleaner
                        if [[ " ${bicleaner_ai_langs_en[*]} " =~ " $srclang " ]]; then
                                #en-src is supported by bicleaner ai
                                is_reversed=true
                                bc_srclang=$trglang
                                bc_trglang=$srclang
                                bicleaner_ai_metadata=$datapath/bicleaner-ai/$trglang-$srclang/metadata.yaml
                        else
                                #en-src not supported by bicleaner ai, but falling back to en-xx
                                echo "Falling back to bicleaner-ai en-xx"
                                is_reversed=true
                                bc_srclang=$trglang
                                bc_trglang=xx
                                bicleaner_ai_metadata=$datapath/bicleaner-ai/en-xx/metadata.yaml
                        fi
                fi
        elif [ "$trglang" == "es" ] ; then
                if [[ " ${bicleaner_langs_es[*]} " =~ " $srclang " ]]; then
                        #es-src is supported by classic bicleaner
                        is_reversed=true
                        bc_srclang=$trglang
                        bc_trglang=$srclang
                        bicleaner_metadata=$datapath/bicleaner/$trglang-$srclang/$trglang-$srclang.yaml
                else
                        #es-src not supported by classic bicleaner
                        if [[ " ${bicleaner_ai_langs_es[*]} " =~ " $srclang " ]]; then
                                #es-src is supported by bicleaner ai
                                is_reversed=true
                                bicleaner_ai_metadata=$datapath/bicleaner-ai/$trglang-$srclang/metadata.yaml
                                bc_srclang=$trglang
                                bc_trglang=$srclang
                        else
                                #es-src not supported by  any bicleaner
                                echo "Unsupported language pair in Bicleaner/BicleanerAI"
                        fi
               	fi
        else
		echo "Unsupported language pair in Bicleaner/BicleanerAI"	
	fi

	if [ "$is_reversed" = true ]; then
		COLUMNS_FLAG=" --scol 2 --tcol 1 "
		REVERSED_FLAG="	--is_reversed "
	else
		COLUMNS_FLAG=" --scol 1 --tcol 2 "
		REVERSED_FLAG=" "
	fi		

	# Check if bicleaner model is downloaded, otherwise download   
	if [ "$bicleaner_metadata" ]; then
    		if [ -f "$bicleaner_metadata" ]; then
    			echo "Bicleaner model already downloaded."
    		else	
 			mkdir -p $datapath/bicleaner
        		echo "Downloading bicleaner model..."
		        wget https://github.com/bitextor/bicleaner-data/releases/latest/download/$bc_srclang-$bc_trglang.tar.gz -O $datapath/bicleaner/tmp.$bc_srclang-$bc_trglang.tar.gz -q
		        tar -xvf $datapath/bicleaner/tmp.$bc_srclang-$bc_trglang.tar.gz -C $datapath/bicleaner/
		        rm $datapath/bicleaner/tmp.$bc_srclang-$bc_trglang.tar.gz
		fi	
    	elif [ "$bicleaner_ai_metadata" ]; then
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
	fi
	
	# Check the format and preprocess the data
	if [ "$format" == "bitext" ]; then
		echo "Converting to TSV..."		
		filename=$(basename "$saved_file_path")
        	tsv_file_path="$workdir/$filename.tsv"        	
	        paste $saved_file_path.$srclang $saved_file_path.$trglang > $tsv_file_path
    	elif [ "$format" == "tmx" ]; then
    		# Get the directory path and filename without extension
    		echo "Converting to TSV..."
	        filename=$(basename "$saved_file_path" .tmx)
	        # Create the new file path with the "tsv" extension
	        tsv_file_path="$workdir/$filename.tsv"
	        python3 ./tmxt/tmxt.py --codelist=$srclang,$trglang $saved_file_path $tsv_file_path
	elif [ "$format" == "tsv" ]; then
        	    filename=$(basename "$saved_file_path")
        	    cp $saved_file_path $workdir
        	    tsv_file_path="$workdir/$filename"

	else
		echo "Unsupported format \"$format\""
		exit 1
        fi

       	# Save into two separate files
       	#rm -f $tsv_file_path.$srclang
       	#rm -f $tsv_file_path.$trglang
       	#awk -F '\t' -v file1=$tsv_file_path.$srclang -v file2=$tsv_file_path.$trglang '{print $1 >> file1; print $2 >> file2}' $tsv_file_path

	#Bicleaner Hardrules
    	source /work/venvs/venv-bhr/bin/activate    	
	if [ "$bicleaner_metadata" ]; then
		echo "Running Bicleaner Hardrules..."
		HR_MODEL=$bicleaner_metadata
		cat $tsv_file_path | $PARALLEL_CACHE_CMD  bicleaner-hardrules --score_only --annotated_output --disable_lang_ident --run_all_rules -p $JOBS -s $bc_srclang -t $bc_trglang $COLUMNS_FLAG - - --metadata $bicleaner_metadata --quiet > $tsv_file_path.hardrules 2> hr.log
	elif [ "$bicleaner_ai_metadata" ]; then
		echo "Running Bicleaner Hardrules..."
		HR_MODEL=$bicleaner_ai_metadata
		cat $tsv_file_path | $PARALLEL_CACHE_CMD bicleaner-hardrules --score_only --annotated_output --disable_lang_ident --run_all_rules -p $JOBS -s $bc_srclang -t $bc_trglang $COLUMNS_FLAG - - --metadata $bicleaner_ai_metadata --quiet > $tsv_file_path.hardrules 2> hr.log
	else
		#echo "Language pair not supported by Bicleaner Hardrules"
		echo "Running Bicleaner Hardrules..."
		HR_MODEL=""
		cat $tsv_file_path | $PARALLEL_CACHE_CMD bicleaner-hardrules --score_only --annotated_output --disable_lang_ident --disable_lm_filter --disable_porn_removal --run_all_rules -p $JOBS -s $srclang -t $trglang $COLUMNS_FLAG --quiet  > $tsv_file_path.hardrules 2> hr.log
    	fi
    	deactivate
    	
    	#Run Bicleaner/BicleanerAI
    	if [ "$bicleaner_metadata" ]; then
    		echo "Running Bicleaner..."
	    	source /work/venvs/venv-bc/bin/activate	
		#Force FastSpell FastText download in this env
		python3 ./scripts/force-fasttext-download.py $srclang
	        python3 ./scripts/force-fasttext-download.py $trglang	    	
		cat $tsv_file_path | $PARALLEL_CACHE_CMD bicleaner-classify -p $JOBS --score_only $COLUMNS_FLAG --disable_hardrules - - $bicleaner_metadata --quiet > $tsv_file_path.classify 2> bc.log
		METADATA_FLAG="-y "$bicleaner_metadata
		deactivate
	elif [ "$bicleaner_ai_metadata" ]; then
		echo "Running Bicleaner AI..."
		source /work/venvs/venv-bcai/bin/activate	
		#Force FastSpell FastText download in this env
		python3 ./scripts/force-fasttext-download.py $srclang
	        python3 ./scripts/force-fasttext-download.py $trglang		
		cat $tsv_file_path | BICLEANER_AI_THREADS=$JOBS $PARALLEL_CACHE_CMD bicleaner-ai-classify --score_only $COLUMNS_FLAG --disable_hardrules - - $bicleaner_ai_metadata --quiet > $tsv_file_path.classify 2> bc.log
		METADATA_FLAG="-y "$bicleaner_ai_metadata
		deactivate
    	else
    		echo "Language pair not supported by Bicleaner/BicleanerAI"
    	fi

	#Fastspell
	#Force FastSpell FastText download in this env
	python3 ./scripts/force-fasttext-download.py $srclang
        python3 ./scripts/force-fasttext-download.py $trglang	
	echo "Running FastSpell..."
	#Map langs
	./scripts/map/parallel-fastspell.sh $JOBS $srclang $tsv_file_path $tsv_file_path.$srclang.langids 1 
	./scripts/map/parallel-fastspell.sh $JOBS $trglang $tsv_file_path $tsv_file_path.$trglang.langids 2	
	#Reduce langs
	cat $tsv_file_path.$srclang.langids | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS | uniq -c | sort -nr  >  $tsv_file_path.srclangs
	cat $tsv_file_path.$trglang.langids | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS | uniq -c | sort -nr  >  $tsv_file_path.trglangs

    	#Stats from readcorpus
	echo "Running ReadCorpus..."
	if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ] || [ "$trglang" = "bn" ] || [ "$trglang" = "ben" ]; then
		source /work/venvs/venv-bnlp/bin/activate	
	fi	
	#python3 ./scripts/readcorpus.py $tsv_file_path $srclang $trglang $tsv_file_path.proc	
	bash /work/scripts/map/parallel-readcorpus.sh $JOBS_READCORPUS $tsv_file_path $srclang $trglang $tsv_file_path.proc
        if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ] || [ "$trglang" = "bn" ] || [ "$trglang" = "ben" ]; then
		deactivate
	fi
	echo "Mapping & Reducing volumes"
	#Map & reduce volumes
	bash /work/scripts/map/parallel-volumes.sh $JOBS $tsv_file_path.proc $tsv_file_path.volumes
	#Map & reduce unique sentence pairs
	cat $tsv_file_path.proc | cut -f 11 | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS |  uniq -c | wc -l | (read COUNT && sed -e 's/$/\t'$COUNT'/' -i $tsv_file_path.volumes)
	#Map & reduce source & target unique tokens 
	cat $tsv_file_path.proc |   cut -f 1,9 | grep  '[0-9]' | LC_ALL=C sort -S 50% --compress-program=zstd | uniq -c | awk -F " " '{sum[$2]+=$1; uni[$2]+=1} END {for (key in sum) {print key, sum[key], uni[key]}}' | sort -n  > $tsv_file_path.srctokcount
	cat $tsv_file_path.proc |  cut -f 2,10 | grep  '[0-9]' | LC_ALL=C sort -S 50% --compress-program=zstd | uniq -c | awk -F ' ' '{sum[$2]+=$1; uni[$2]+=1} END {for (key in sum) {print key, sum[key], uni[key]}}' | sort -n  > $tsv_file_path.trgtokcount
	
	
	echo "Computing ngrams"
        for SUFFIX_ORDER in one_1 two_2 three_3 four_4 five_5
        do
                SUFFIX=$(echo $SUFFIX_ORDER  | cut -d "_" -f 1)
                ORDER=$(echo $SUFFIX_ORDER | cut -d "_" -f 2)
                echo "Order " $ORDER
                SRC_COLUMN=$((11 + $ORDER)) #11 previous columns with other metadata
                TRG_COLUMN=$((16 + $ORDER)) #11 previous columns with other metadata + 5 columns with src ngrams
                parallel --jobs $JOBS --pipepart -a $tsv_file_path.proc cut -f $SRC_COLUMN  > $tsv_file_path.$srclang.$SUFFIX
                parallel --jobs $JOBS --pipepart -a $tsv_file_path.proc cut -f $TRG_COLUMN  > $tsv_file_path.$trglang.$SUFFIX                
         
                #Taking SIX most common ngrams because probably one of them will be the empty spaces and will be removed in the awk below
                LC_ALL=C sort $tsv_file_path.$srclang.$SUFFIX -S 50% --compress-program=zstd --parallel $JOBS | uniq -c | LC_ALL=C sort -nr -S 50% --compress-program=zstd --parallel $JOBS | head -n 6 |   awk -v ORDER=$ORDER 'length($2) == 0{next;}{for (i=2; i<NF; i++) printf $i " "; print $NF"\t"$1"\t"ORDER}' >> $tsv_file_path.$srclang".ngrams"
                LC_ALL=C sort $tsv_file_path.$trglang.$SUFFIX -S 50% --compress-program=zstd --parallel $JOBS | uniq -c | LC_ALL=C sort -nr -S 50% --compress-program=zstd --parallel $JOBS | head -n 6 |   awk -v ORDER=$ORDER 'length($2) == 0{next;}{for (i=2; i<NF; i++) printf $i " "; print $NF"\t"$1"\t"ORDER}' >> $tsv_file_path.$trglang".ngrams"
                
                if [ "$DEBUGFLAG" = false ]; then
		        rm -rf $tsv_file_path.$srclang.$SUFFIX
		        rm -rf $tsv_file_path.$trglang.$SUFFIX 
		fi                          
        done
	
	echo "Extracting samples"
	cat $tsv_file_path | shuf -n 50 > $tsv_file_path".sample"
	
	rm -rf $yaml_file_path	
	touch $yaml_file_path
	
	echo "Writing yaml file"
	#Metadata
	if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ] || [ "$trglang" = "bn" ] || [ "$trglang" = "ben" ]; then
                source /work/venvs/venv-bnlp/bin/activate       
        fi
	python3 /work/scripts/reduce/write_metadata.py $yaml_file_path $(basename "$tsv_file_path") $srclang $trglang $bicleaner_ai_metadata
	if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ] || [ "$trglang" = "bn" ] || [ "$trglang" = "ben" ]; then
         	deactivate
        fi
	#Volumes
	python3 /work/scripts/reduce/write_volumes.py $tsv_file_path.volumes $yaml_file_path
	#Unique token counts
	python3 /work/scripts/reduce/write_tokcounts.py $yaml_file_path $tsv_file_path.srctokcount $tsv_file_path.trgtokcount 
	#Langcount
	python3 /work/scripts/reduce/write_langs.py $yaml_file_path $tsv_file_path.srclangs $tsv_file_path.trglangs 
	#Hardrules
	if [ -f $tsv_file_path.hardrules ] ; then
		python3 /work/scripts/reduce/write_hardrules.py $tsv_file_path.hardrules $yaml_file_path $HR_MODEL
	fi
	#Bicleaner scores
	if [ -f $tsv_file_path.classify ] ; then
                python3 /work/scripts/reduce/write_bicleaner.py $tsv_file_path.classify $yaml_file_path
        fi
	

        python3 ./scripts/reduce/addngrams.py $tsv_file_path.$srclang".ngrams"  $yaml_file_path "src"
        python3 ./scripts/reduce/addngrams.py $tsv_file_path.$trglang".ngrams"  $yaml_file_path "trg"
	python3 ./scripts/reduce/write_sample.py $tsv_file_path".sample" $yaml_file_path "parallel"

elif [ "$langformat" == "mono" ]; then
	if [ "$format" == "tmx" ]; then
		echo "Extracting from TMX..."
                # Get the directory path and filename without extension
                filename=$(basename "$saved_file_path" .tmx)
                # Create the new file path with the "tsv" extension
                tsv_file_path="$workdir/$filename.tsv"
                python3 ./tmxt/tmxt.py --codelist=$srclang $saved_file_path $tsv_file_path
        elif [ "$format" == "tsv" ]; then        		
        	cp $saved_file_path $workdir
		filename=$(basename "$saved_file_path" )
                tsv_file_path="$workdir/$filename" #if the input file is in tsv format
	elif [ "$DOCS" = true ]; then
		echo "Extracting documents..."
                # Get the directory path and filename without extension
                original_filename=$(basename -- "$saved_file_path")
                extension="${original_filename##*.}"
		filename=$(basename  "$original_filename" ."$extension")
                # Create the new file path with the "tsv" extension                
                tsv_file_path="$workdir/$filename.tsv"
                
                if [ "$extension" == "zst" ] || [ "$extension" == "zstd" ] ; then
		        zstdcat $saved_file_path | bash /work/scripts/map/parallel-readdocuments.sh $JOBS - $srclang $tsv_file_path.docproc $format

		elif [ "$extension" == "parquet" ]; then
			python3 scripts/deparquet.py $saved_file_path - | bash /work/scripts/map/parallel-readdocuments.sh $JOBS - $srclang $tsv_file_path.docproc $format

                else
                	cat $saved_file_path | bash /work/scripts/map/parallel-readdocuments.sh $JOBS - $srclang $tsv_file_path.docproc $format
                fi


		echo "Mapping & Reducing document volumes"
		#Map & reduce document volumes
		#bash /work/scripts/map/document-volumes.sh $JOBS $tsv_file_path.docproc $tsv_file_path.docvolumes
		#Volumes
		cat $tsv_file_path.docproc | cut -f 1 | parallel -j $JOBS --pipe awk -F \'\\t\' \'length\(\$1\) == 0{next\;}{sum0+=1\; sum1+=\$1\;} END {print sum0 \"\\t\" sum1 }\'  | awk -F "\t" '{sum0+=$1; sum1+=$2;} END {print sum0 "\t" sum1}'  > $tsv_file_path.docvolumes
		#Map & reduce document sentences
		cat $tsv_file_path.docproc |  cut -f 1 |  grep  '[0-9]'  | LC_ALL=C sort -S 50% --compress-program=zstd | uniq -c | awk -F " " '{sum[$2]+=$1;} END {for (key in sum) {print sum[key], key}}'  > $tsv_file_path.docsents
		#WDS
		cat $tsv_file_path.docproc | cut -f 2 | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS |  uniq -c > $tsv_file_path.wds
		#sents in doclang
		cat $tsv_file_path.docproc | cut -f 3 | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS |  uniq -c  > $tsv_file_path.doclangs
		#collections
		cat $tsv_file_path.docproc | cut -f 4 | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS |  uniq -c | sort -nr  > $tsv_file_path.collections
		#domains
		cat $tsv_file_path.docproc | cut -f 5 | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS |  uniq -c | LC_ALL=C sort -nr -S 50% --compress-program=zstd --parallel $JOBS | head -n 101  > $tsv_file_path.domains
		#tlds
		cat $tsv_file_path.docproc | cut -f 6 | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS |  uniq -c | LC_ALL=C sort -nr -S 50% --compress-program=zstd --parallel $JOBS | head -n 101 > $tsv_file_path.tlds		
		
		#doing this for compatibility with non-document formats in the next steps
		cat $tsv_file_path.docproc | cut -f 7 | awk 'length() == 0{next;} {print;}' > $tsv_file_path 
		if [ "$DEBUGFLAG" = false ]; then
			rm $tsv_file_path.docproc
		fi
						
		#Register labels
		if [ "$SKIPRLFLAG" = false ]; then		
		        if [[ " ${registerlabels_langs[*]} " =~ " $srclang " ]]; then	        
		        	source /work/venvs/venv-rl/bin/activate
		        	echo "Running register labels..."   	
		        	if [ "$extension" == "zst" ] || [ "$extension" == "zstd" ]; then
					zstdcat $saved_file_path | python3 ./scripts/registerlabels.py --batchsize $GPU_BATCHSIZE  > $tsv_file_path.rl
				else
					cat $saved_file_path | python3 ./scripts/registerlabels.py  --batchsize $GPU_BATCHSIZE> $tsv_file_path.rl
				fi
				deactivate
			        cat $tsv_file_path.rl | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS | uniq -c | sort -nr  >  $tsv_file_path.rlcounts
		        else
        			echo "Register labels not supported for $srclang"
		        fi
                else
                        echo "Skipping register labels"
                fi

                #Domain labels
                if [ "$SKIPDLFLAG" = false ]; then
                        if [[ " ${domainlabels_langs[*]} " =~ " $srclang " ]]; then
                                source /work/venvs/venv-rl/bin/activate
                                echo "Running domain labels..."
                                if [ "$extension" == "zst" ] || [ "$extension" == "zstd" ]; then
                                        zstdcat $saved_file_path | python3 ./scripts/domainlabels.py --batchsize $GPU_BATCHSIZE_DL > $tsv_file_path.dl
                                elif [ "$extension" == "parquet" ]; then
                                        python3 scripts/deparquet.py $saved_file_path - | python3 ./scripts/domainlabels.py --batchsize $GPU_BATCHSIZE_DL > $tsv_file_path.dl
                                else
                                        cat $saved_file_path | python3 ./scripts/domainlabels.py --batchsize $GPU_BATCHSIZE_DL > $tsv_file_path.dl
                                fi
                                deactivate
                                cat $tsv_file_path.dl | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS | uniq -c | sort -nr > $tsv_file_path.dlcounts
                        else
                                echo "Domain labels not supported for $srclang"
                        fi
                else
                        echo "Skipping domain labels"
                fi

        else
                echo "Unsupported format \"$format\""
                exit 1
        fi
	
	#Monolingual hardrules
	if [[ " ${monocleaner_langs[*]} " =~ " $srclang " ]]; then
		#Lang supported by monocleaner
		monocleaner_metadata=$datapath/monocleaner/$srclang/metadata.yaml
		mkdir -p $datapath/monocleaner
	fi
	source /work/venvs/venv-mc/bin/activate
	echo "Running Monocleaner  Hardrules..."
	cat $tsv_file_path | $MONO_CACHE_CMD  parallel -k -j $JOBS --pipe monocleaner-hardrules --score_only --annotated_output --run_all_rules --disable_lang_ident  $srclang - - --quiet > $tsv_file_path.hardrules 2> hr.log
	deactivate


        #Fastspell
        echo "Running FastSpell..."
	#Force Fasttext download, in case it does not exist in this environment, to avoid doing it in parallel
	python3 /work/scripts/force-fasttext-download.py $srclang        
        ./scripts/map/parallel-fastspell.sh $JOBS $srclang $tsv_file_path $tsv_file_path.langids 1 
        cat $tsv_file_path.langids | LC_ALL=C sort --parallel $JOBS -S 50% --compress-program=zstd | uniq -c | sort -nr  >  $tsv_file_path.srclangs


	#Read corpus mono
	echo "Running ReadCorpus Mono..."
	if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ]; then
                source /work/venvs/venv-bnlp/bin/activate
        fi	
	bash /work/scripts/map/parallel-readcorpus-mono.sh $JOBS_READCORPUS $tsv_file_path $srclang $tsv_file_path.proc	
	if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ]; then
		deactivate
	fi
	
	#Map & reduce volumes
	echo "Mapping & Reducing volumes..."
	bash /work/scripts/map/parallel-volumes-mono.sh $JOBS $tsv_file_path.proc $tsv_file_path.volumes
	#Map & reduce unique sentences
	cat $tsv_file_path.proc | cut -f 5 | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS |  uniq -c | wc -l | (read COUNT && sed -e 's/$/\t'$COUNT'/' -i $tsv_file_path.volumes)
	#Map & reduce source & target unique tokens 
	cat $tsv_file_path.proc | cut -f 1,5 | grep  '[0-9]' | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS  | uniq -c | awk -F " " '{sum[$2]+=$1; uni[$2]+=1} END {for (key in sum) {print key, sum[key], uni[key]}}' | sort -n  > $tsv_file_path.srctokcount

        echo "Computing ngrams"
        for SUFFIX_ORDER in one_1 two_2 three_3 four_4 five_5
        do
                SUFFIX=$(echo $SUFFIX_ORDER  | cut -d "_" -f 1)
                ORDER=$(echo $SUFFIX_ORDER | cut -d "_" -f 2)
                echo "Order " $ORDER
                SRC_COLUMN=$((5 + $ORDER)) #5 previous columns with other metadata
                parallel --jobs $JOBS --pipepart -a $tsv_file_path.proc cut -f $SRC_COLUMN  > $tsv_file_path.$SUFFIX

                #Taking SIX most common ngrams because probably one of them will be the empty spaces and will be removed in the awk below
                LC_ALL=C sort $tsv_file_path.$SUFFIX -S 50% --compress-program=zstd --parallel $JOBS | uniq -c | LC_ALL=C sort -nr -S 50% --compress-program=zstd --parallel $JOBS | head -n 6 | awk -v ORDER=$ORDER 'length($2) == 0{next;}{for (i=2; i<NF; i++) printf $i " "; print $NF"\t"$1"\t"ORDER}' >> $tsv_file_path".ngrams"
                
                if [ "$DEBUGFLAG" = false ]; then
		        rm -rf $tsv_file_path.$SUFFIX
		fi
        done
       
       	echo "Obtaining sample"
       	if [ "$DOCS" = true ]; then
	       	if [ "$extension" == "zst" ] || [ "$extension" == "zstd" ] ; then
                        zstdcat $saved_file_path | shuf -n 20 | jq .text > $tsv_file_path".sample"

                elif [ "$extension" == "parquet" ]; then
                        python3 scripts/deparquet.py $saved_file_path - | shuf -n 20 | jq .text  > $tsv_file_path".sample"

                else
                        cat $saved_file_path | shuf -n 20 | jq .text > $tsv_file_path".sample"
                fi

       	else
       		cat $tsv_file_path | shuf -n 50 > $tsv_file_path".sample"
       	fi

	rm -rf $yaml_file_path	
	touch $yaml_file_path

	echo "Writing yaml file"
	#Write metadata
	if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ] || [ "$trglang" = "bn" ] || [ "$trglang" = "ben" ]; then
                source /work/venvs/venv-bnlp/bin/activate       
        fi
	python3 /work/scripts/reduce/write_metadata.py $yaml_file_path $(basename "$tsv_file_path") $srclang 
	if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ] || [ "$trglang" = "bn" ] || [ "$trglang" = "ben" ]; then
                deactivate
        fi
	#Write docs stats
	if [ "$DOCS" = true ]; then
		python3 /work/scripts/reduce/write_docstats.py $yaml_file_path $tsv_file_path.docvolumes $tsv_file_path.docsents $tsv_file_path.wds $tsv_file_path.doclangs $tsv_file_path.collections $tsv_file_path.domains $tsv_file_path.tlds
	fi
	#Volumes
	python3 /work/scripts/reduce/write_volumes.py $tsv_file_path.volumes $yaml_file_path
	#Unique token counts
	python3 /work/scripts/reduce/write_tokcounts.py $yaml_file_path $tsv_file_path.srctokcount
	#Langcount
	python3 /work/scripts/reduce/write_langs.py $yaml_file_path $tsv_file_path.srclangs
	
	#Hardrules
	if [ -f $tsv_file_path.hardrules ] ; then
		python3 /work/scripts/reduce/write_hardrules.py $tsv_file_path.hardrules $yaml_file_path $HR_MODEL
	fi

        if [ -f $tsv_file_path.rlcounts ] ; then
                python3 /work/scripts/reduce/write_registerlabels.py $tsv_file_path.rlcounts $yaml_file_path
        fi

        if [ -f $tsv_file_path.dlcounts ] ; then
                python3 /work/scripts/reduce/write_domainlabels.py $tsv_file_path.dlcounts $yaml_file_path
        fi

        python3 ./scripts/reduce/addngrams.py $tsv_file_path".ngrams"  $yaml_file_path "src"
        if [ "$DOCS" = true ]; then
	        python3 ./scripts/reduce/write_sample.py $tsv_file_path".sample" $yaml_file_path "docs"
	else
	        python3 ./scripts/reduce/write_sample.py $tsv_file_path".sample" $yaml_file_path "mono"
	fi


else
	echo "Unsupported langformat \"$langformat\""
	exit 1
fi

if [ "$DEBUGFLAG" = false ]; then
	rm -rf $workdir 
fi
