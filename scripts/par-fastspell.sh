#!/bin/bash

langcode=$1

INPUT_FILE=$(mktemp)

cat > $INPUT_FILE
fastspell --aggr $langcode ${INPUT_FILE} --quiet | cut -f2 2> fastspell.log > ${INPUT_FILE}.o

cat ${INPUT_FILE}.o

rm -Rf $INPUT_FILE ${INPUT_FILE}.o
