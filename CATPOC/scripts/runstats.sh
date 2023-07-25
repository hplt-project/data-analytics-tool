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

#bicleanermetadata=bicleaner/$srclang-$trglang/$srclang-$trglang.yaml
#monocleanermetadata=monocleaner/$srclang/metadata.yaml

bicleaner_langs_en=(bg ca cs da de el es et fi fr ga hr hu is it lt lv mt nb nl nn pl pt ro ru sk sl sv uk)
bicleaner_langs_es=(ca de gl eu)

bicleaner_ai_langs_en=(ar bg ca cs da de el es et eu fi fr ga gl hbs he hi hu is it ja lt lv mk mt nb nl nn pl pt ro sk sl sq sv sw tr uk vi zh)
bicleaner_ai_langs_es=(ca de gl eu zh)

monocleaner_langs=(ar az bg bs ca cnr cs da de el en es et eu fa fi fr ga gl hbs he hi hr hu is it ja ko lt lt lv mk ms mt nb nl nn pl pt ro ru sk sl sq sr sv sw th tr uk vi)

mkdir -p $datapath

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
   				bicleaner_ai_metadata=$datapath/bicleaner-ai/$srclang-$trglang/metadata.yaml
   				bc_srclang=$srclang
   				bc_trglang=$trglang
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
	                bicleaner-ai-download $bc_srclang $bc_trglang full $datapath/bicleaner-ai
	                deactivate
		fi
	fi
	

	# Check the format and preprocess the data
	if [ "$format" == "bitext" ]; then
        	tsv_file_path=$saved_file_path.tsv
	        parallel -j $JOBS paste $saved_file_path.$srclang  $saved_file_path.$trglang > $tsv_file_path
    	else # if format is tmx or tsv
        	if [ "$format" == "tmx" ]; then
	            # Get the directory path and filename without extension
	            dir_path=$(dirname "$saved_file_path")
	            filename=$(basename "$saved_file_path" .tmx)
	            # Create the new file path with the "tsv" extension
	            tsv_file_path="$dir_path/$filename.tsv"
	            python3 ./tmxt/tmxt.py --codelist=$srclang,$trglang $saved_file_path $tsv_file_path
	        else
        	    tsv_file_path=$saved_file_path #if the input file is in tsv format
	        fi
        	# Save into two separate files
        	rm -f $saved_file_path.$srclang
        	rm -f $saved_file_path.$trglang
        	awk -F '\t' -v file1=$saved_file_path.$srclang -v file2=$saved_file_path.$trglang '{print $1 >> file1; print $2 >> file2}' $tsv_file_path
        	#cat  $tsv_file_path | awk -F '\t' -v file1=$saved_file_path.$srclang  -v file2=$saved_file_path.$trglang '{print $1 >> file1; print $2 >> file2}
	        #time parallel -j $JOBS -k cut -f1 $tsv_file_path > $saved_file_path.$srclang
	        #echo "CUT"
	        #time parallel -j $JOBS -k cut -f2 $tsv_file_path > $saved_file_path.$trglang
	fi
    
	#Bicleaner Hardrules
    	source /work/venvs/venv-bhr/bin/activate
	if [ "$bicleaner_metadata" ]; then
		if [ "$is_reversed" = true ]; then
			bicleaner-hardrules --annotated_output --run_all -p $JOBS -s $bc_srclang -t $bc_trglang --scol 2  --tcol 1 $tsv_file_path $saved_file_path.bicleaner-hardrules --metadata $bicleaner_metadata		
		else
			bicleaner-hardrules --annotated_output --run_all -p $JOBS -s $bc_srclang -t $bc_trglang $tsv_file_path $saved_file_path.bicleaner-hardrules --metadata $bicleaner_metadata
		fi
	elif [ "$bicleaner_ai_metadata" ]; then
		if [ "$is_reversed" = true ]; then
			bicleaner-hardrules --annotated_output --run_all -p $JOBS -s $bc_srclang -t $bc_trglang --scol 2 --tcol 1 $tsv_file_path $saved_file_path.bicleaner-hardrules --metadata $bicleaner_ai_metadata
		else
			bicleaner-hardrules --annotated_output --run_all -p $JOBS -s $bc_srclang -t $bc_trglang $tsv_file_path $saved_file_path.bicleaner-hardrules --metadata $bicleaner_ai_metadata
		fi
	else
		echo "Language pair not supported by Bicleaner Hardrules"
    	fi
    	deactivate
    
    	#Run Bicleaner/BicleanerAI
    	if [ "$bicleaner_metadata" ]; then
	    	source /work/venvs/venv-bc/bin/activate
	    	if [ "$is_reversed" = true ]; then
		    	bicleaner-classify -p $JOBS --score_only --scol 2 --tcol 1 --disable_hardrules $tsv_file_path $saved_file_path.bicleaner-classify $bicleaner_metadata
	    	else
			bicleaner-classify -p $JOBS --score_only --scol 1 --tcol 2 --disable_hardrules $tsv_file_path $saved_file_path.bicleaner-classify $bicleaner_metadata
		fi
		deactivate
	elif [ "$bicleaner_ai_metadata" ]; then
		source /work/venvs/venv-bcai/bin/activate
		if [ "$is_reversed" = true ]; then
			BICLEANER_AI_THREADS=$JOBS bicleaner-ai-classify --score_only --scol 2 --tcol 1 --disable_hardrules $tsv_file_path $saved_file_path.bicleaner-classify $bicleaner_ai_metadata
		else	
			BICLEANER_AI_THREADS=$JOBS bicleaner-ai-classify --score_only --scol 1 --tcol 2 --disable_hardrules $tsv_file_path $saved_file_path.bicleaner-classify $bicleaner_ai_metadata
		fi
		deactivate
    	else
    		echo "Language pair not supported by Bicleaner/BicleanerAI"
    	fi
    	
    	#Stats from readcorpus
    	#mkdir -p profiling
	#time  python3 -m cProfile  -s cumtime ./scripts/readcorpus.py $tsv_file_path $yaml_file_path $srclang $trglang > profiling/profile.text 2>&1
	if [ "$is_reversed" = true ]; then
		time  python3 ./scripts/readcorpus.py $tsv_file_path $yaml_file_path $srclang $trglang --is_reversed
	else
		time  python3 ./scripts/readcorpus.py $tsv_file_path $yaml_file_path $srclang $trglang 
	fi

else
	#Monolingual
	if [[ " ${monocleaner_langs[*]} " =~ " $srclang " ]]; then
		#Lang supported by monocleaner
		monocleaner_metadata=$datapath/monocleaner/$srclang/metadata.yaml
		mkdir -p $datapath/monocleaner
	else
		echo "Language not supported by Monocleaner"
	fi

	if [ "$monocleaner_metadata" ]; then
		source /work/venvs/venv-mc/bin/activate
		if [ -f "$monocleaner_metadata" ]; then
	        	echo "Monocleaner model already downloaded."
	        else
		        echo "Downloading monocleaner model..."		       
		        monocleaner-download -q $srclang $datapath/monocleaner/
		fi	
		#cat $datapath/monocleaner/$srclang $saved_file_path | parallel -j $JOBS --pipe parallel-monocleaner.sh > $saved_file_path.monocleaner-classify
		./scripts/parallel-monocleaner.sh $JOBS $datapath/monocleaner/$srclang $saved_file_path  $saved_file_path.monocleaner-classify
		# time monocleaner $datapath/monocleaner/$srclang $saved_file_path $saved_file_path.monocleaner-classify
		deactivate
	fi
	#time python3 -m cProfile ./scripts/readcorpus_mono.py $saved_file_path $yaml_file_path $srclang
	python3 ./scripts/readcorpus_mono.py $saved_file_path $yaml_file_path $srclang
fi