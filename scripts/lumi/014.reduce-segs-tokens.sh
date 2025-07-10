#!/bin/bash

#IN: a proc file
#OUT: a srctokcount file

procfile=$1

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$procfile" .proc)
	
#Map & reduce source & target unique tokens 
cat $procfile | cut -f 1,5 | grep  '[0-9]' | LC_ALL=C sort -S 80% --compress-program=zstd --parallel $JOBS  | uniq -c | awk -F " " '{sum[$2]+=$1; uni[$2]+=1} END {for (key in sum) {print key, sum[key], uni[key]}}' | sort -n  > $filename.srctokcount
	
		

