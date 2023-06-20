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
    saved_file_path=$tsv_file_path
fi


python3 ./scripts/readcorpus.py $saved_file_path $yaml_file_path $srclang $trglang


#!/bin/bash

# Store the command line arguments in variables
saved_file_path=$1

# Get the directory path and filename without extension
dir_path=$(dirname "$saved_file_path")
filename=$(basename "$saved_file_path" .tmx)

# Create the new file path with the "tsv" extension
new_file_path="$dir_path/$filename.tsv"

# Print the new file path
echo "New file path: $new_file_path"
``
