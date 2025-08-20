#!/bin/bash

#IN: a rl file
#OUT: a rlcounts file

rlfile=$1

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$rlfile" .rl)
	
#regiser labels
cat $rlfile | LC_ALL=C sort -S 80% --compress-program=zstd --parallel $JOBS | uniq -c | sort -nr  >  $filename.rlcounts