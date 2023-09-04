#!/bin/bash
JOBS=$1
langpath=$2
inputfile=$3
outputfile=$4

cat $inputfile | /work/preprocess/build/bin/cache -k 1  parallel -k  -j $JOBS --pipe ./scripts/par-monocleaner.sh $langpath > $outputfile