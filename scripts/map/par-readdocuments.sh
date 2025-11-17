#!/bin/bash

srclang=$1
format=$2

INPUT_FILE=$(mktemp)

cat > $INPUT_FILE
source /work/venvs/venv-docs/bin/activate
python3.12 /work/scripts/readdocuments.py ${INPUT_FILE} $srclang  - --format $format --quiet  2> readdocuments.log > ${INPUT_FILE}.o
deactivate

cat ${INPUT_FILE}.o

rm -Rf $INPUT_FILE ${INPUT_FILE}.o

