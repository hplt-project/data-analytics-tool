#!/bin/bash

lang=$1

INPUT_FILE=$(mktemp)

cat > $INPUT_FILE

monocleaner-hardrules --score_only --annotated_output $lang ${INPUT_FILE} ${INPUT_FILE}.o &>monohr.log

cat ${INPUT_FILE}.o

rm -Rf $INPUT_FILE ${INPUT_FILE}.o