#!/bin/bash
JOBS=$1
inputfile=$2
srclang=$3
srclang2=$4
outputfile=$5


cat $inputfile  | parallel -j $JOBS --pipe ./scripts/map/par-readcorpus-mono.sh $srclang $srclang2 > $outputfile



