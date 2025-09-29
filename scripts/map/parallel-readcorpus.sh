#!/bin/bash
JOBS=$1
inputfile=$2
srclang=$3
trglang=$4
outputfile=$5
srclang2=$6
trglang2=$7

cat $inputfile  | parallel -j $JOBS --pipe ./scripts/map/par-readcorpus.sh $srclang $trglang $srclang2 $trglang2 > $outputfile



