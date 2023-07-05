#!/bin/bash

# Store the command line arguments in variables
saved_file_path=$1
yaml_file_path=$2
srclang=$3
trglang=$4
format=$5
langformat=$6
bicleanermetadata=bicleaner/$srclang-$trglang/$srclang-$trglang.yaml
monocleanermetadata=monocleaner/$srclang/metadata.yaml

# Check if its monolingual or bilingual corpus
if [ "$langformat" == "parallel" ]; then
    # Check if bicleaner model is downloaded, otherwise download
    if [ -f "$bicleanermetadata" ]; then
        echo "Bicleaner model already downloaded."
    else
        if [ ! -d "bicleaner" ]; then
            mkdir "bicleaner"
        fi
        echo "Downloading bicleaner model..."
        wget https://github.com/bitextor/bicleaner-data/releases/download/v1.6/$srclang-$trglang.tar.gz -O bicleaner/tmp.tar.gz -q
        tar -xvf bicleaner/tmp.tar.gz -C bicleaner/
        rm bicleaner/tmp.tar.gz
    fi

    # Check the format and preprocess the data
    if [ "$format" == "bitext" ]; then
        tsv_file_path=$saved_file_path.tsv
        paste $saved_file_path.$srclang  $saved_file_path.$trglang > $tsv_file_path
    else # if format is tmx or tsv
        if [ "$format" == "tmx" ]; then
            # Get the directory path and filename without extension
            dir_path=$(dirname "$saved_file_path")
            filename=$(basename "$saved_file_path" .tmx)
            # Create the new file path with the "tsv" extension
            tsv_file_path="$dir_path/$filename.tsv"
            python3 ./tmxt/tmxt.py --codelist=$srclang,$trglang $saved_file_path $tsv_file_path
        else
            tsv_file_path=$saved_file_path #if the input file is in tsv format
        fi
        # Save into two separate files
        cut -f1 $tsv_file_path > $saved_file_path.$srclang
        cut -f2 $tsv_file_path > $saved_file_path.$trglang
    fi
    source /work/venvs/venv-bhr/bin/activate
    bicleaner-hardrules --annotated_output --run_all -s $srclang -t $trglang $tsv_file_path $saved_file_path.bicleaner-hardrules --metadata $bicleanermetadata
    deactivate
    
    source /work/venvs/venv-bc/bin/activate
    bicleaner-classify --scol 1 --tcol 2 $tsv_file_path $saved_file_path.bicleaner-classify $bicleanermetadata
    deactivate
    
    python3 ./scripts/readcorpus.py $tsv_file_path $yaml_file_path $srclang $trglang
else
    source /work/venvs/venv-mc/bin/activate
    # Check if monocleaner model is downloaded, otherwise download
    if [ -f "$monocleanermetadata" ]; then
        echo "Monocleaner model already downloaded."
    else
        if [ ! -d "monocleaner" ]; then
            mkdir "monocleaner"
        fi
        echo "Downloading monocleaner model..."
        monocleaner-download en monocleaner/
    fi
    monocleaner monocleaner/$srclang $saved_file_path $saved_file_path.monocleaner-classify
    deactivate
    python3 ./scripts/readcorpus_mono.py $saved_file_path $yaml_file_path $srclang
fi