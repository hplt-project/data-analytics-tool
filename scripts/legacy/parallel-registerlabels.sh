#!/bin/bash
JOBS=$1
GPUS=$2
inputfile=$3
outputfile=$4

if [[ $GPUS -gt 0 ]]; then 
	cat $inputfile
else
	cat $inputfile | CUTA_VISIBLE_DEVICES='' parallel -j $JOBS --pipe ./scripts/par-registerlabels.sh  > $outputfile
fi

