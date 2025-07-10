#!/bin/bash

#IN: a docproc file
#OUT:  a docvolumes file

docprocfile=$1


JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$docprocfile" .docproc)

#Map & reduce document volumes
cat $docprocfile | cut -f 1 | parallel -j $JOBS --pipe awk -F \'\\t\' \'length\(\$1\) == 0{next\;}{sum0+=1\; sum1+=\$1\;} END {print sum0 \"\\t\" sum1 }\'  | awk -F "\t" '{sum0+=$1; sum1+=$2;} END {print sum0 "\t" sum1}'  > $filename.docvolumes