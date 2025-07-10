#!/bin/bash

#IN: a docproc file
#OUT: a domains file

docprocfile=$1

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$docprocfile" .docproc)
	
#domains
cat $docprocfile | cut -f 5 | LC_ALL=C sort -S 80% --compress-program=zstd --parallel $JOBS |  uniq -c | LC_ALL=C sort -nr -S 80% --compress-program=zstd --parallel $JOBS | head -n 101  > $filename.domains
		

