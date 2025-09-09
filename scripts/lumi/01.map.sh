#!/bin/bash
set -euo pipefail

#IN:  a zstd file, a language code
#OUT: a tsv ,  a docproc and a proc files

srclang=$1
format=$2
inputfile=$3
outfile="$OUT_DIR/$(basename $inputfile)"

if [ -z "${HQ_CPUS+x}" ]; then
    echo HQ_CPUS=$HQ_CPUS >&2
    JOBS=$(echo $HQ_CPUS | tr -cd ',' | wc -c)
else
    JOBS=$(nproc)
fi
echo Running with $JOBS cpus >&2
JOBS_LOW=$((JOBS/3*2))
JOBS_LOW=$(($JOBS_LOW>1 ? $JOBS_LOW : 1))
echo Running with $JOBS_LOW cpus for high memory processes >&2

echo "##### Read documents #####" >&2
zstdcat $inputfile \
| parallel --pipe -j$JOBS_LOW --block 20M --halt now,fail=1 \
    python3 /work/scripts/readdocuments.py $srclang --format $format \
| zstdmt \
>$outfile.docproc.zst \
|| {
    echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
    exit 1
}

echo "##### Read corpus #####" >&2
zstdcat $outfile.docproc.zst \
| cut -f 7 \
| awk 'length() == 0{next;} {print;}' \
| zstdmt \
> $outfile.tsv.zst

if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ]; then
    source /work/venvs/venv-bnlp/bin/activate
fi
zstdcat $outfile.tsv.zst \
| parallel --pipe -j$JOBS_LOW --block 10M --halt now,fail=1 \
    python3 /work/scripts/readcorpus_mono.py $srclang --quiet \
| zstdmt \
>$outfile.proc.zst \
|| {
    echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
    exit 1
}

if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ]; then
    deactivate
fi

echo "##### Monocleaner #####" >&2
source /work/venvs/venv-mc/bin/activate
zstdcat $outfile.tsv.zst \
| /work/preprocess/build/bin/cache -k 1 parallel -k -j $JOBS --block 10M --pipe --halt now,fail=1 \
    monocleaner-hardrules \
    --score_only --annotated_output \
    --run_all_rules --disable_lang_ident \
    $srclang - - \
| zstdmt \
> $outfile.hardrules.zst \
|| {
    echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
    exit 1
}
deactivate

echo "##### Fastspell #####" >&2
zstdcat $outfile.tsv.zst \
| parallel --pipe -j$JOBS --block 20M --halt now,fail=1 \
    fastspell --aggr $srclang --quiet \
| cut -f2 \
| zstdmt \
>$outfile.langids.zst \
|| {
    echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
    exit 1
}

rm $outfile.tsv.zst
