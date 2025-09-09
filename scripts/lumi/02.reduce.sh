#!/bin/bash
if [ ! -z "${HQ_CPUS+x}" ]; then
    JOBS=$(echo $HQ_CPUS | tr -cd ',' | wc -c)
else
    JOBS=$(nproc)
fi
SORT_MEM="-S 80%"
if [ ! -z "${HQ_RESOURCE_REQUEST_mem+x}" ]; then
    # If HQ has a specified requested mem, use it
    # otherwise sort will use all node available mem
    # which may be higher than the slurm requested mem and be killed by OOM
    hq_mem=$(echo "print(int(${HQ_RESOURCE_REQUEST_mem% *}*0.8))" | python3)
    SORT_MEM="-S ${hq_mem}M"
fi
export SORT_MEM
set -euo pipefail

reduce_hardrules() {
    zstd -T$JOBS
}

reduce_doc_volumes() {
    cut -f 1 \
    | awk -F "\t" 'length($1) == 0{next;}{sum0+=1; sum1+=$1;} END {print sum0 "\t" sum1 }' \
    | awk -F "\t" '{sum0+=$1; sum1+=$2;} END {print sum0 "\t" sum1}' \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

reduce_doc_sents() {
    cut -f 1 \
    | grep '[0-9]' \
    | LC_ALL=C sort $SORT_MEM --compress-program=zstd --parallel=$JOBS \
    | uniq -c \
    | awk -F " " '{sum[$2]+=$1;} END {for (key in sum) {print sum[key], key}}' \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

reduce_doc_wds() {
    cut -f 2 \
    | grep -v '^[[:blank:]]*$' \
    | LC_ALL=C sort $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | uniq -c \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}
reduce_doc_doclangs() {
    cut -f 3 \
    | grep -v '^[[:blank:]]*$' \
    | LC_ALL=C sort $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | uniq -c \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

reduce_doc_collections() {
    cut -f4 \
    | grep -v '^[[:blank:]]*$' \
    | LC_ALL=C sort $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | uniq -c \
    | sort -nr \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

reduce_doc_domains() {
    cut -f 5 \
    | grep -v '^[[:blank:]]*$' \
    | LC_ALL=C sort $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | uniq -c \
    | LC_ALL=C sort -nr $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | awk 'NR <= 101' \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

reduce_doc_tlds() {
    cut -f 6 \
    | grep -v '^[[:blank:]]*$' \
    | LC_ALL=C sort $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | uniq -c \
    | LC_ALL=C sort -nr $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | awk 'NR <= 101' \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

reduce_segs_langs() {
    LC_ALL=C sort --parallel $JOBS $SORT_MEM --compress-program=zstd \
    | uniq -c \
    | sort -nr \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

reduce_segs_volumes() {
    cut -f 1,2,3,4 \
    | awk -F "\t" -v OFS="\t" \
        'length($1) != 0 {sum0+=1; sum1+=$1; sum2+=$2; sum3+=$3; sum4+=$4; } END {print sum0,sum1,sum2,sum3,sum4}' \
    | awk -F "\t" -v OFS="\t" \
        '{sum0+=$1; sum1+=$2; sum2+=$3; sum3+=$4; sum4+=$5; } END {print sum0,sum1,sum2,sum3,sum4}' \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

reduce_segs_unique() {
    cut -f 5 \
    | LC_ALL=C sort $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | uniq -c \
    | wc -l \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

reduce_segs_tokens() {
    cut -f 1,5 \
    | grep '[0-9]' \
    | LC_ALL=C sort $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | uniq -c \
    | awk -F " " '{sum[$2]+=$1; uni[$2]+=1} END {for (key in sum) {print key, sum[key], uni[key]}}' \
    | sort -n
}

reduce_ngrams() {
    local order=$1
    local column=$((5+order))
    local sorted_ngrams=$(mktemp)
    trap "rm -f $sorted_ngrams" EXIT

    cut -f$column \
    | LC_ALL=C sort $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | uniq -c \
    | zstdmt \
    >$sorted_ngrams

    zstdcat $sorted_ngrams \
    | LC_ALL=C sort -nr $SORT_MEM --compress-program=zstd --parallel $JOBS \
    | awk 'NR <= 6' \
    | awk -v order=$order 'length($2) == 0{next;}{for (i=2; i<NF; i++) printf $i " "; print $NF"\t"$1"\t"order}' \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
}

choose_task() {
    local task=$1
    export TASK_PARAMS=""
    case "$task" in
        hardrules)
            export OUTPUT_FILE=$OUT_DIR/reduce.hardrules.zst
            export INPUT_SUFFIX=".hardrules.zst"
            export TASK_FUNC="reduce_hardrules"
            ;;
        doc-volumes)
            export OUTPUT_FILE=$OUT_DIR/reduce.docvolumes
            export INPUT_SUFFIX=".docproc.zst"
            export TASK_FUNC="reduce_doc_volumes"
            ;;
        doc-sents)
            export OUTPUT_FILE=$OUT_DIR/reduce.docsents
            export INPUT_SUFFIX=".docproc.zst"
            export TASK_FUNC="reduce_doc_sents"
            ;;
        doc-wds)
            export OUTPUT_FILE=$OUT_DIR/reduce.wds
            export INPUT_SUFFIX=".docproc.zst"
            export TASK_FUNC="reduce_doc_wds"
            ;;
        doc-doclangs)
            export OUTPUT_FILE=$OUT_DIR/reduce.doclangs
            export INPUT_SUFFIX=".docproc.zst"
            export TASK_FUNC="reduce_doc_doclangs"
            ;;
        doc-collections)
            export OUTPUT_FILE=$OUT_DIR/reduce.collections
            export INPUT_SUFFIX=".docproc.zst"
            export TASK_FUNC="reduce_doc_collections"
            ;;
        doc-domains)
            export OUTPUT_FILE=$OUT_DIR/reduce.domains
            export INPUT_SUFFIX=".docproc.zst"
            export TASK_FUNC="reduce_doc_domains"
            ;;
        doc-tlds)
            export OUTPUT_FILE=$OUT_DIR/reduce.tlds
            export INPUT_SUFFIX=".docproc.zst"
            export TASK_FUNC="reduce_doc_tlds"
            ;;
        segs-langs)
            export OUTPUT_FILE=$OUT_DIR/reduce.srclangs
            export INPUT_SUFFIX=".langids.zst"
            export TASK_FUNC="reduce_segs_langs"
            ;;
        segs-volumes)
            export OUTPUT_FILE=$OUT_DIR/reduce.volumes
            export INPUT_SUFFIX=".proc.zst"
            export TASK_FUNC="reduce_segs_volumes"
            ;;
        segs-unique)
            export OUTPUT_FILE=$OUT_DIR/reduce.srcunique
            export INPUT_SUFFIX=".proc.zst"
            export TASK_FUNC="reduce_segs_unique"
            ;;
        segs-tokens)
            export OUTPUT_FILE=$OUT_DIR/reduce.srctokcount
            export INPUT_SUFFIX=".proc.zst"
            export TASK_FUNC="reduce_segs_tokens"
            ;;
        onegrams)
            export OUTPUT_FILE=$OUT_DIR/reduce.onegrams
            export INPUT_SUFFIX=".proc.zst"
            export TASK_FUNC="reduce_ngrams"
            export TASK_PARAMS="1"
            ;;
        twograms)
            export OUTPUT_FILE=$OUT_DIR/reduce.twograms
            export INPUT_SUFFIX=".proc.zst"
            export TASK_FUNC="reduce_ngrams"
            export TASK_PARAMS="2"
            ;;
        threegrams)
            export OUTPUT_FILE=$OUT_DIR/reduce.threegrams
            export INPUT_SUFFIX=".proc.zst"
            export TASK_FUNC="reduce_ngrams"
            export TASK_PARAMS="3"
            ;;
        fourgrams)
            export OUTPUT_FILE=$OUT_DIR/reduce.fourgrams
            export INPUT_SUFFIX=".proc.zst"
            export TASK_FUNC="reduce_ngrams"
            export TASK_PARAMS="4"
            ;;
        fivegrams)
            export OUTPUT_FILE=$OUT_DIR/reduce.fivegrams
            export INPUT_SUFFIX=".proc.zst"
            export TASK_FUNC="reduce_ngrams"
            export TASK_PARAMS="5"
            ;;
        *) echo "Error reduce task $task is not defined" >&2
            exit 1
            ;;
    esac
}

reduce_task=$1
# dynamically choose the task
# defining input files, output files, task function and task params
choose_task $reduce_task

echo "Running task $TASK_FUNC $TASK_PARAMS" >&2
echo "Using $JOBS cpus and $SORT_MEM mem" >&2

for filename in $INPUT_FILES; do
    cat $OUT_DIR/$(basename $filename)$INPUT_SUFFIX
done \
| zstdcat \
| "$TASK_FUNC" "$TASK_PARAMS" \
>$OUTPUT_FILE.tmp \
|| {
    echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
    exit 1
}

mv $OUTPUT_FILE.tmp $OUTPUT_FILE
