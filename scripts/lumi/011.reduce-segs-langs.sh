#!/bin/bash

#IN: a langids file
#OUT: a srclangs file

langidsfile=$1

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$langidsfile" .langids)
	
#src langs
cat $langidsfile | LC_ALL=C sort --parallel $JOBS -S 80% --compress-program=zstd | uniq -c | sort -nr  >  $filename.srclangs
	
		

