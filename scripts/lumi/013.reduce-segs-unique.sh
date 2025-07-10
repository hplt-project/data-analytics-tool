#!/bin/bash

#IN: a proc file, a volumes file
#OUT: a volumes file

procfile=$1
volumesfile=$2

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

#filename=$(basename "$procfile" .proc)
	
#Map & reduce unique sentences
cat $procfile | cut -f 5 | LC_ALL=C sort -S 80% --compress-program=zstd --parallel $JOBS |  uniq -c | wc -l | (read COUNT && sed -e 's/$/\t'$COUNT'/' -i $volumesfile)
	
		

