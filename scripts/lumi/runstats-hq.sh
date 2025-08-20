#!/bin/bash
set -euo pipefail


lang=ast
work_dir=$(pwd -P)/data/work
format=hplt
corpusname=hplt-v2
log_dir=./logs
input_files=$(ls data/asts_?.jsonl.zst)

mkdir -p $log_dir $work_dir
yaml_file_path=$(pwd -P)/data/$lang-$corpusname.yml
input_dir=$(dirname $input_files | head -1)
input_dir=$(realpath $input_dir)
jobname=$lang-$format

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
env = { "INPUT_FILES" = "$(echo $input_files)", "SRCLANG" = "$lang", "OUT_DIR" = "$work_dir"}
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
    ["segs-tokens"]="all"
    ["onegrams"]="all"
    ["twograms"]="all"
    ["threegrams"]="all"
    ["fourgrams"]="all"
    ["fivegrams"]="all"
)

## Create reduce job definition file
jobfile=$log_dir/jobfile-reduce-$jobname.toml
cat >$jobfile << EOF
name = "reduce-$jobname"
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


trap "hq job cancel all; exit 1" INT
# Run map tasks
echo "##### Map #####" >&2
hq submit --progress --name map-$jobname \
    --max-fails=0 --stream=$log_dir \
    --each-line <(ls -1 $input_files) \
    --cpus all --env OUT_DIR=$work_dir \
    singularity exec \
        -B data-analytics-tool/scripts:/work/scripts \
        -B $input_dir \
        data-analytics-tool/data-analytics.sif \
        /work/scripts/lumi/01.map.sh $lang $format

# Run reduce
echo "##### Reduce #####" >&2
set +e
submit_out=$(hq job submit-file --output-mode json $jobfile)
if [ $? -ne 0 ]; then
    echo $submit_out | jq -r .error
    exit 1
fi
set -e
job_id=$(echo $submit_out | jq -r .id)
echo "Job submitted successfully, job ID: job_id" >&2
hq job progress $job_id

echo "##### Creating yaml #####" >&2
hq submit --progress --name yaml-$jobname \
    --max-fails 0 --stream=$log_dir \
    --resource "cpus=2" --resource "mem=4000" \
    /usr/bin/time -v singularity exec \
        -B data-analytics-tool/scripts:/work/scripts \
        -B $input_dir \
        data-analytics-tool/data-analytics.sif \
        /work/scripts/lumi/03.write_yaml.sh $yaml_file_path $lang $corpusname $work_dir/reduce
