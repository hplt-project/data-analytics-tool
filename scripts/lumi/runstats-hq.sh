#!/bin/bash
set -euo pipefail

lang=ast
input_dir=$(pwd -P)/data
input_files=$(ls $input_dir/asts_?.jsonl.zst)
output_dir=$(pwd -P)/data
format=hplt
log_dir=./logs

# print singularity command with profiling
# mount points, script to run and task
singularity-command() {
    local task=$1
cat <<EOF
command = [
"/usr/bin/time", "-v",
"singularity", "exec", "-B", "data-analytics-tool/scripts:/work/scripts",
"-B", "$input_dir",
"data-analytics-tool/data-analytics.sif",
"/work/scripts/lumi/02.reduce.sh", "$task"]
EOF

}

# print the env variables for the reduce yml taskfile
reduce-env() {
cat <<EOF
env = { "INPUT_FILES" = "$(echo $input_files)", "SRCLANG" = "$lang", "OUT_DIR" = "$output_dir"}
EOF
}

declare -A task_cpus
task_cpus=(
    ["doc-volumes"]="8"
    ["doc-sents"]="all"
    ["doc-wds"]="all"
    ["doc-doclangs"]="all"
    ["doc-collections"]="all"
    ["doc-domains"]="all"
    ["doc-tlds"]="all"
    ["segs-langs"]="all"
    ["segs-volumes"]="8"
    ["segs-unique"]="all"
    ["onegrams"]="all"
    ["twograms"]="all"
    ["threegrams"]="all"
    ["fourgrams"]="all"
    ["fivegrams"]="all"
)

trap "hq job cancel all; exit 1" INT
# Run map tasks
hq submit --progress --name map-$lang-$format \
    --max-fails=0 --stream=$log_dir \
    --each-line <(ls -1 $input_files) \
    --cpus all \
    singularity exec \
        -B data-analytics-tool/scripts:/work/scripts \
        -B $input_dir \
        data-analytics-tool/data-analytics.sif \
        /work/scripts/lumi/01.map.sh $lang $format \

jobfile=$log_dir/jobfile-reduce-$lang-$format.toml
cat >$jobfile << EOF
name = "reduce-$lang-$format"
stream = "./logs"
EOF

# print each task entry of job definition file
task_id=1
for task in ${!task_cpus[@]};
do
    echo "[[task]]"
    echo "id = $task_id"
    singularity-command $task
    reduce-env
    echo "[[task.request]]"
    echo "resources = { "cpus" = \"${task_cpus[$task]}\" }"
    let task_id++
done >>$jobfile

# Run reduce
hq job submit-file $jobfile
