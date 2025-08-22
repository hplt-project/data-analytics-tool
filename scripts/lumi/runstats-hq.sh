#!/bin/bash
set -euo pipefail


lang=$1
format=$2
corpusname=$3
yaml_file_path=$4
work_dir=$5
input_files=${@:6}

input_files=$(realpath $input_files)
work_dir=$(realpath $work_dir)
yaml_file_path=$(realpath $yaml_file_path)

log_dir=./logs
sort_tmp=/tmp
node_mem=224000
mem_per_cpu=1750
DEBUGFLAG=true

work_dir=$(mktemp -dp $work_dir)
echo "Running on $work_dir"
mkdir -p $log_dir $sort_tmp
input_dir=$(dirname $input_files | head -1)
jobname=$lang-$format

# print singularity command with profiling
# mount points, script to run and task
singularity-command() {
    local task=$1
cat <<EOF
command = [
"/usr/bin/time", "-v",
"singularity", "exec", "-B", "data-analytics-tool/scripts:/work/scripts",
"-B", "$input_dir", "-B",  "$work_dir",
"data-analytics-tool/data-analytics.sif",
"/work/scripts/lumi/02.reduce.sh", "$task"]
EOF

}

# print the env variables for the reduce yml taskfile
reduce-env() {
cat <<EOF
env = { "INPUT_FILES" = "$(echo $input_files)", "SRCLANG" = "$lang", "OUT_DIR" = "$work_dir", "TMPDIR" = "$sort_tmp" }
EOF
}

declare -A task_cpus
task_cpus=(
    ["hardrules"]="8"
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
stream = "$log_dir"
max_fails = 0
EOF

# print each task entry of job definition file
task_id=1
for task in ${!task_cpus[@]};
do
    echo "[[task]]"
    echo "id = $task_id"
    singularity-command $task
    reduce-env
    echo "crash_limit = 1"
    echo "[[task.request]]"
    cpus=${task_cpus[$task]}
    if [ "$cpus" == "all" ]; then
        echo "resources = { \"cpus\" = \"$cpus\", \"mem\" = \"$node_mem\" }"
    else
        mem=$((cpus*mem_per_cpu))
        echo "resources = { \"cpus\" = \"$cpus\", \"mem\" = \"$mem\" }"
    fi
    let task_id++
done >>$jobfile


trap "hq job cancel all; exit 1" INT
# Run map tasks
echo "##### Map #####" >&2
hq submit --progress --name map-$jobname \
    --max-fails=0 --crash-limit=1 \
    --stream=$log_dir \
    --each-line <(ls -1 $input_files) \
    --cpus all --env OUT_DIR=$work_dir \
    singularity exec \
        -B data-analytics-tool/scripts:/work/scripts \
        -B $input_dir -B $work_dir \
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
echo "Job submitted successfully, job ID: $job_id" >&2
hq job progress $job_id

echo "##### Creating yaml #####" >&2
hq submit --progress --name yaml-$jobname \
    --max-fails 0 --crash-limit=1 \
    --stream=$log_dir \
    --resource "cpus=2" --resource "mem=4000" \
    /usr/bin/time -v singularity exec \
        -B data-analytics-tool/scripts:/work/scripts \
        -B $input_dir -B $work_dir \
        data-analytics-tool/data-analytics.sif \
        /work/scripts/lumi/03.write_yaml.sh $yaml_file_path $lang $corpusname $work_dir/reduce

if [ "$DEBUGFLAG" = false ]; then
    rm -rf $work_dir
fi
