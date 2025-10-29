#!/bin/bash

#IN:  a zstd file, a language code
#OUT: a rl file

#This should be OUTSIDE this script
#supported languages:
registerlabels_langs=(af sq am ar hy as az eu be bn bs br bg my ca zh hr cs da nl en eo et tl fi fr gl ka de el gu ha he hi hu is id ga it ja jv \
	kn kk km ko ku ky lo la lv lt mk mg ms ml mr mn ne no nn nb or om ps fa pl pt pa ro ru sa gd sr sd si sk sl so es su sw sv ta te th tr uk ur ug uz vi cy fy xh yi)
GPU_BATCHSIZE=512

inputfile=$1
srclang=$2



if [[ " ${registerlabels_langs[*]} " =~ " $srclang " ]]; then	        
	source /work/venvs/venv-rl/bin/activate
	zstdcat $inputfile | python3 ./scripts/registerlabels.py --batchsize $GPU_BATCHSIZE  > $inputfile.rl
	deactivate
fi


