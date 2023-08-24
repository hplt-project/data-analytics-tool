#!/bin/bash
JOBS=$1
langcode=$2
inputfile=$3
outputfile=$4
column=$5

cat $inputfile | cut -f $column |  parallel -j $JOBS --pipe ./scripts/par-fastspell.sh $langcode > $outputfile


