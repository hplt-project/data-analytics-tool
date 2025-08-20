#!/bin/bash

#IN: a zstd file
#OUT:  a sample file

inputfile=$1

zstdcat $inputfile | shuf -n 20 | jq .text > $inputfile".sample"