#!/bin/bash

#IN: a tsv file
#OUT:  a hardrules file

tsv_file_path=$1
srclang=$2

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

source /work/venvs/venv-mc/bin/activate
cat $tsv_file_path | /work/preprocess/build/bin/cache -k 1  parallel -k -j $JOBS --pipe monocleaner-hardrules --score_only --annotated_output --run_all_rules --disable_lang_ident  $srclang - - > $tsv_file_path.hardrules 2> hr.log
deactivate