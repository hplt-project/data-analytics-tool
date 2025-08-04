#!/bin/bash

srclang=$1
format=$2

INPUT_FILE=$(mktemp)

cat > $INPUT_FILE
python3 /work/scripts/readdocuments.py ${INPUT_FILE} $srclang  - --format $format --quiet  2> readdocuments.log > ${INPUT_FILE}.o

cat ${INPUT_FILE}.o

rm -Rf $INPUT_FILE ${INPUT_FILE}.o

