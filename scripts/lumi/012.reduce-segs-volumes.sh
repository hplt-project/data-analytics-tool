#!/bin/bash

#IN: a proc file
#OUT: a volumes file

procfile=$1

JOBS=$(($(nproc)-2))
JOBS=$(($JOBS>1 ? $JOBS : 1))

filename=$(basename "$procfile" .proc)
	
#Map & reduce volumes
bash /work/scripts/map/parallel-volumes-mono.sh $JOBS $procfile $filename.volumes
	
		

