#!/bin/bash
set -euo pipefail

#IN: 
# 1. path for yaml file
# 2. srclang
# 3. Corpus name
# 4. filename (i.e. the name without the .prod, .docproc, ... extensions)

#OUT: a yaml file

set -x
yaml_file_path=$1
srclang=$2
corpusname=$3
filename=$4

rm -rf $yaml_file_path	
touch $yaml_file_path	

#Metadata
if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ]; then
	source /work/venvs/venv-bnlp/bin/activate       
fi
python3 /work/scripts/reduce/write_metadata.py $yaml_file_path $corpusname $srclang 
if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ]; then
	deactivate
fi

#Document stats
python3 /work/scripts/reduce/write_docstats.py $yaml_file_path $filename.docvolumes $filename.docsents $filename.wds $filename.doclangs $filename.collections $filename.domains $filename.tlds

#Volumes
# paste volumes and srcunique because write_volume expects it in the same file
python3 /work/scripts/reduce/write_volumes.py <(paste $filename.volumes $filename.srcunique) $yaml_file_path

#Unique token counts
python3 /work/scripts/reduce/write_tokcounts.py $yaml_file_path $filename.srctokcount

#Langcount
python3 /work/scripts/reduce/write_langs.py $yaml_file_path $filename.srclangs
	
#Hardrules
if [ -f $filename.hardrules.zst ] ; then
    python3 /work/scripts/reduce/write_hardrules.py <(zstdcat $filename.hardrules.zst) $yaml_file_path ""
fi

#Register labels
if [ -f $filename.rlcounts ] ; then
	python3 /work/scripts/reduce/write_registerlabels.py $filename.rlcounts $yaml_file_path
fi	

#Samples
if [ -f $filename.rlcounts ] ; then
	python3 /work/scripts/reduce/write_sample.py $filename.sample $yaml_file_path "docs"
fi

#Ngrams
cat $filename.{one,two,three,four,five}grams >$filename.ngrams
python3 /work/scripts/reduce/addngrams.py $filename".ngrams"  $yaml_file_path "src"
