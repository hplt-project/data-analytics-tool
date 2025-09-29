#!/bin/bash

srclang=$1
trglang=$2
srclang2=$3
trglang2=$4

INPUT_FILE=$(mktemp)

cat > $INPUT_FILE
python3 /work/scripts/readcorpus.py ${INPUT_FILE} $srclang $trglang  - $srclang2 $trglang2 --quiet  2> readcorpus.log > ${INPUT_FILE}.o

cat ${INPUT_FILE}.o

rm -Rf $INPUT_FILE ${INPUT_FILE}.o

