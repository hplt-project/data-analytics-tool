#!/bin/bash

#IN: a docproc file
#OUT: a collections file

docprocfile=$1

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$docprocfile" .docproc)

		
#collections
cat $docprocfile | cut -f 4 | LC_ALL=C sort -S 80% --compress-program=zstd --parallel $JOBS |  uniq -c | sort -nr  > $filename.collections
		

