#!/bin/bash

#IN: 
# 1. path for yaml file
# 2. srclang
# 3. Corpus name
# 4. filename (i.e. the name without the .prod, .docproc, ... extensions)

#OUT: a yaml file

yaml_file_path=$1
srclang=$2
corpusname=$3
filename=$4

rm -rf $yaml_file_path	
touch $yaml_file_path	

#Metadata
if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ] || [ "$trglang" = "bn" ] || [ "$trglang" = "ben" ]; then
	source /work/venvs/venv-bnlp/bin/activate       
fi
python3 /work/scripts/reduce/write_metadata.py $yaml_file_path $corpusname $srclang 
if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ] || [ "$trglang" = "bn" ] || [ "$trglang" = "ben" ]; then
	deactivate
fi

#Document stats
python3 /work/scripts/reduce/write_docstats.py $yaml_file_path $filename.docvolumes $filename.docsents $filename.wds $filename.doclangs $filename.collections $filename.domains $filename.tlds

#Volumes
python3 /work/scripts/reduce/write_volumes.py $filename.volumes $yaml_file_path

#Unique token counts
python3 /work/scripts/reduce/write_tokcounts.py $yaml_file_path $filename.srctokcount

#Langcount
python3 /work/scripts/reduce/write_langs.py $yaml_file_path $filename.srclangs
	
#Hardrules
if [ -f $filename.hardrules ] ; then
	python3 /work/scripts/reduce/write_hardrules.py $filename.hardrules $yaml_file_path ""
fi

#Register labels
#if [ -f $filename.rlcounts ] ; then
#	python3 /work/scripts/reduce/write_registerlabels.py $filename.rlcounts $yaml_file_path
#fi	

#Ngrams
python3 ./scripts/reduce/addngrams.py $filename".ngrams"  $yaml_file_path "src"
