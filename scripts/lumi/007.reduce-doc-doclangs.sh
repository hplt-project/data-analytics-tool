#!/bin/bash

#IN: a docproc file
#OUT: a doclangs file

docprocfile=$1


JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$docprocfile" .docproc)

#sents in doclang
cat $docprocfile | cut -f 3 | LC_ALL=C sort -S 80% --compress-program=zstd --parallel $JOBS |  uniq -c  > $filename.doclangs

