#!/bin/bash

#IN: a docproc file
#OUT:  a docsents file

docprocfile=$1


JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$docprocfile" .docproc)

#Map & reduce document sentences
cat $docprocfile |  cut -f 1 |  grep  '[0-9]'  | LC_ALL=C sort -S 80% --compress-program=zstd | uniq -c | awk -F " " '{sum[$2]+=$1;} END {for (key in sum) {print sum[key], key}}'  > $filename.docsents