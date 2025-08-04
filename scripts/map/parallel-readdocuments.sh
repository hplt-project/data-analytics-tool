#!/bin/bash
JOBS=$1
inputfile=$2
srclang=$3
outputfile=$4
format=$5

cat $inputfile  | parallel -j $JOBS --pipe ./scripts/map/par-readdocuments.sh $srclang $format > $outputfile
