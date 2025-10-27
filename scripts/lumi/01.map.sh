#!/bin/bash
set -euo pipefail

#IN:  a zstd file, a language code
#OUT: a tsv ,  a docproc and a proc files

srclang=$1
format=$2
inputfile=$3
outfile="$OUT_DIR/$(basename $inputfile)"
srclang2=$(python /work/scripts/lang_equivalent.py $1)

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

if [ -f $outfile.langids.zst ] && [ $(du $outfile.langids.zst |cut -f1) -gt 13 ]; then
    echo "Task already completed, skipping..." >&2
    exit 0
fi

echo "##### Read samples #####" >&2
zstdcat $inputfile \
| shuf -n20 \
| jq .text \
| zstdmt \
>$outfile.sample.zst

echo "##### Read documents #####" >&2
zstdcat $inputfile \
| parallel --pipe -j$JOBS_LOW --block 20M --halt now,fail=1 \
    python3 /work/scripts/readdocuments.py $srclang --format $format \
| zstdmt -10 \
>$outfile.docproc.zst \
|| {
    echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
    exit 1
}

echo "#### Read registerlabels #####" >&2
has_registers=$(zstdcat $inputfile | tail -1 | jq '."web-register" != null')
echo "Has registers: $has_registers" >&2
if [ "$format" == "hplt-v3" ] && [ "$has_registers" == "true" ]; then
    zstdcat $inputfile \
    | python3 /work/scripts/reuse-registerlabels.py \
    | zstdmt \
    >$outfile.rl.zst \
    || {
        echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
        exit 1
    }
fi

echo "##### Read corpus #####" >&2
zstdcat $outfile.docproc.zst \
| cut -f 7 \
| awk 'length() == 0{next;} {print;}' \
| zstdmt -10 \
> $outfile.tsv.zst

if [ "$srclang" = "bn" ]  || [ "$srclang" = "ben" ]; then
    source /work/venvs/venv-bnlp/bin/activate
fi
zstdcat $outfile.tsv.zst \
| parallel --pipe -j$JOBS_LOW --block 10M --halt now,fail=1 \
    python3 /work/scripts/readcorpus_mono.py $srclang $srclang2 --quiet \
| zstdmt -10 \
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
>$outfile.langids.zst.tmp \
|| {
    echo "Error in pipeline: ${PIPESTATUS[@]}" >&2
    exit 1
}
mv $outfile.langids.zst.tmp $outfile.langids.zst

rm $outfile.tsv.zst
