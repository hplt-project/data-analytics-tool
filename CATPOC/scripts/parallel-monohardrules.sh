#!/bin/bash
JOBS=$1
lang=$2
inputfile=$3
outputfile=$4
cat $inputfile | parallel -j $JOBS --pipe ./scripts/par-monohardrules.sh $lang > $outputfile