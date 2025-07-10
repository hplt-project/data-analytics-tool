#!/bin/bash

#IN: a docproc file
#OUT: a wds file

docprocfile=$1


JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$docprocfile" .docproc)

#WDS
cat $docprocfile | cut -f 2 | LC_ALL=C sort -S 50% --compress-program=zstd --parallel $JOBS |  uniq -c > $filename.wds
