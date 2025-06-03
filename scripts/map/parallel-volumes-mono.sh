#! /bin/bash
JOBS=$1
inputfile=$2
outputfile=$3

#This script actually maps (in the parallel+awk part) and reduces too (last awk part)

#COLUMNS:
# 1:srctokcount 2:srcbytes 3:srcchars  4:srcpii 5:srchash 
# 6:src_onegrams 7:src_twograms 8:src_threegrams 9:src_fourgrams 10:src_fivegrams
#sum0 is the amount of sentences
cat $inputfile | cut -f 1,2,3,4 | parallel -j $JOBS --pipe awk -F \'\\t\' \'length\(\$1\) == 0{next\;}{sum0+=1\; sum1+=\$1\; sum2+=\$2\; sum3+=\$3\; sum4+=\$4\; } END {print sum0 \"\\t\" sum1 \"\\t\" sum2 \"\\t\" sum3 \"\\t\" sum4}\'  | awk -F "\t" '{sum0+=$1; sum1+=$2; sum2+=$3; sum3+=$4; sum4+=$5; } END {print sum0 "\t" sum1 "\t" sum2 "\t" sum3 "\t" sum4}'  > $outputfile







