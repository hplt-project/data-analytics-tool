#! /bin/bash
JOBS=$1
inputfile=$2
outputfile=$3

#This script actually maps (in the parallel+awk part) and reduces too (last awk part)

#COLUMNS:
# 1: srctokcount 2: trgtokcount 3:srcbytes 4:trgbytes 5:srcchars 6:trgchars 7:srcpii 8:trgpii
# srchash trghash pairhash
# src_onegrams src_twograms src_threegrams src_fourgrams src_fivegrams
# trg_onegrams trg_twograms trg_threegrams trg_fourgrams trg_fivegrams 
#sum0 is the amount of sentences
cat $inputfile | cut -f 1,2,3,4,5,6,7,8 | parallel -j $JOBS --pipe awk -F \'\\t\' \'length\(\$1\) == 0{next\;}{sum0+=1\; sum1+=\$1\; sum2+=\$2\; sum3+=\$3\; sum4+=\$4\; sum5+=\$5\; sum6+=\$6\; sum7+=\$7\; sum8+=\$8\;} END {print sum0 \"\\t\" sum1 \"\\t\" sum2 \"\\t\" sum3 \"\\t\" sum4 \"\\t\" sum5\"\\t\" sum6 \"\\t\" sum7 \"\\t\" sum8}\'  | awk -F "\t" '{sum0+=$1; sum1+=$2; sum2+=$3; sum3+=$4; sum4+=$5; sum5+=$6; sum6+=$7; sum7+=$8; sum8+=$9;} END {print sum0 "\t" sum1 "\t" sum2 "\t" sum3 "\t" sum4 "\t" sum5 "\t" sum6 "\t" sum7 "\t" sum8}'  > $outputfile







