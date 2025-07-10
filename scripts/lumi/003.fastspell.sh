#!/bin/bash

#IN: a tsv file
#OUT:  a langids file

tsv_file_path=$1
srclang=$2

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

python3 /work/scripts/force-fasttext-download.py $srclang        
./scripts/map/parallel-fastspell.sh $JOBS $srclang $tsv_file_path $tsv_file_path.langids 1 
#cat $tsv_file_path.langids | LC_ALL=C sort --parallel $JOBS -S 80% --compress-program=zstd | uniq -c | sort -nr  >  $tsv_file_path.srclangs

