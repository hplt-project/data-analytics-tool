#!/bin/bash

srclang=$1

INPUT_FILE=$(mktemp)

cat > $INPUT_FILE
python3 /work/scripts/readcorpus_mono.py ${INPUT_FILE} $srclang  - --quiet  2> readcorpus-mono.log > ${INPUT_FILE}.o

cat ${INPUT_FILE}.o

rm -Rf $INPUT_FILE ${INPUT_FILE}.o

