#!/bin/bash


INPUT_FILE=$(mktemp)

cat > $INPUT_FILE
CUDA_VISIBLE_DEVICES='' python3 /work/scripts/registerlabels.py  ${INPUT_FILE}  2> /work/registerlabels.log > ${INPUT_FILE}.o

cat ${INPUT_FILE}.o

rm -Rf $INPUT_FILE ${INPUT_FILE}.o
