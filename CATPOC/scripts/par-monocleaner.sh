#!/bin/bash

langpath=$1

INPUT_FILE=$(mktemp)

cat > $INPUT_FILE

monocleaner --score_only --disable_hardrules $langpath ${INPUT_FILE} ${INPUT_FILE}.o &>mono.log

cat ${INPUT_FILE}.o

rm -Rf $INPUT_FILE ${INPUT_FILE}.o