#!/bin/bash

#IN:  a zstd file, a language code
#OUT: a tsv ,  a docproc and a proc files

inputfile=$1
srclang=$2
format=hplt

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))
JOBS_READCORPUS=$(($JOBS/3*2))


zstdcat $inputfile | bash /work/scripts/map/parallel-readdocuments.sh $JOBS - $srclang $inputfile.docproc $format
cat $inputfile.docproc | cut -f 7 | awk 'length() == 0{next;} {print;}' > $inputfile.tsv
#TODO: Activate venv-bnlp if language is Bangla
if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ]; then
	source /work/venvs/venv-bnlp/bin/activate
fi
cat  $inputfile.tsv | bash /work/scripts/map/parallel-readcorpus-mono.sh $JOBS_READCORPUS  - $srclang $inputfile.proc	

if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ]; then
	deactivate
fi