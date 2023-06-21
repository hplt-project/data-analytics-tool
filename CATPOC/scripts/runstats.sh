#!/bin/bash

# Store the command line arguments in variables
saved_file_path=$1
yaml_file_path=$2
srclang=$3
trglang=$4
format=$5

# Check if the format is "tmx" and extract sentences
if [ "$format" == "tmx" ]; then
    # Get the directory path and filename without extension
    dir_path=$(dirname "$saved_file_path")
    filename=$(basename "$saved_file_path" .tmx)
    # Create the new file path with the "tsv" extension
    tsv_file_path="$dir_path/$filename.tsv"
    python3 ./scripts/tmxt.py --codelist=$srclang,$trglang $saved_file_path $tsv_file_path
    # Save into two separate files
    cut -f1 $tsv_file_path > $saved_file_path.$srclang
    cut -f2 $tsv_file_path > $saved_file_path.$trglang
elif [ "$format" == "tsv" ]; then # For now, we will assume it is the first two columns
    # Save into two separate files
    cut -f1 $saved_file_path > $saved_file_path.$srclang
    cut -f2 $saved_file_path > $saved_file_path.$trglang
fi

python3 ./scripts/readcorpus.py $saved_file_path $yaml_file_path $srclang $trglang