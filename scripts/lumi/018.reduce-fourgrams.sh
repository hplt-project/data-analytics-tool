#!/bin/bash

#IN: a proc file
#IN/OUT: a ngrams file

procfile=$1
ngramsfile=$2

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$procfile" .proc)
	
SUFFIX=four
ORDER=4
SRC_COLUMN=$((5 + $ORDER))

parallel --jobs $JOBS --pipepart -a $procfile cut -f $SRC_COLUMN  > $filename.$SUFFIX
LC_ALL=C sort $filename.$SUFFIX -S 80% --compress-program=zstd --parallel $JOBS | uniq -c | LC_ALL=C sort -nr -S 80% --compress-program=zstd --parallel $JOBS | head -n 6 | awk -v ORDER=$ORDER 'length($2) == 0{next;}{for (i=2; i<NF; i++) printf $i " "; print $NF"\t"$1"\t"ORDER}' >> $ngramsfile
