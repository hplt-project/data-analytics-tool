#!/bin/bash
set -euo pipefail


lang=$1
lang3=$2
format=hplt-v3
corpusname=hplt-v3-$lang3
yaml_file_path=yamls-hplt-v3/$lang3.yaml
work_dir=/scratch/project_465001890/zaragoza/data-analytics-processing
#input_files=/scratch/project_465001890/zaragoza/monotextor-processing/bigs-samples/$lang3.jsonl.zst
#input_files=/scratch/project_465001890/zaragoza/monotextor-processing/cleaned/$lang3/*.jsonl.zst
input_files=/scratch/project_465001890/zaragoza/monotextor-processing/ungrouped/data.hplt-project.org/$lang3/*.jsonl.zst

input_files=$(realpath $input_files)
work_dir=$(realpath $work_dir)
work_dir=$work_dir/$corpusname
yaml_file_path=$(realpath $yaml_file_path)

log_dir=./logs
sort_tmp=$work_dir/tmp
node_mem=224000
mem_per_cpu=1750
DEBUGFLAG=true

echo "Running on $work_dir" >&2
mkdir -p $log_dir $sort_tmp $work_dir
input_dir=$(dirname $input_files | tail -1)
jobname=$lang-$corpusname
echo $jobname >$work_dir/jobname

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
EOF
    for i in ${@}; do
        printf " \"$i\","
    done
    echo "]"
}

# print the env variables for each kind of task
map-env() {
cat <<EOF
env = { "OUT_DIR" = "$work_dir" }
EOF
}

reduce-env() {
cat <<EOF
env = { "INPUT_FILES" = "$(echo $input_files)", "SRCLANG" = "$lang", "OUT_DIR" = "$work_dir", "TMPDIR" = "$sort_tmp" }
EOF
}

yaml-env() {
cat <<EOF
env = { "OUT_DIR" = "$work_dir", "DEBUGFLAG" = "$DEBUGFLAG" }
EOF
}

# print task dependencies with a range of task ids
print-deps() {
    local start=$1
    local end=$2
    printf "deps = ["
    for i in $(seq $start $end); do
        printf "$i,"
    done
    echo "]"
}

declare -A task_cpus
task_cpus=(
    ["hardrules"]="8"
    ["doc-sample"]="8"
    ["doc-volumes"]="8"
    ["doc-sents"]="all"
    ["doc-wds"]="all"
    ["doc-doclangs"]="all"
    ["doc-collections"]="all"
    ["doc-domains"]="all"
    ["doc-tlds"]="all"
    ["doc-registerlabels"]="all"
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
name = "$jobname"
stream = "$log_dir"
max_fails = 0
EOF

task_id=1
for infile in $(ls $input_files)
do
    echo "[[task]]"
    echo "id = $task_id"
    echo "crash_limit = 1"
    singularity-command /work/scripts/lumi/01.map.sh $lang $format $infile
    map-env
    echo "[[task.request]]"
    echo 'resources = { "cpus" = "all" }'
    echo

    let task_id++
done>>$jobfile
map_len=$((task_id-1))

# print each task entry of job definition file
for task in ${!task_cpus[@]};
do
    if [ "$task" == "doc-registerlabels" ] && [ "$format" != "hplt-v3" ]; then
        continue
    fi
    echo "[[task]]"
    echo "id = $task_id"
    singularity-command /work/scripts/lumi/02.reduce.sh $task
    reduce-env
    echo "crash_limit = 1"
    print-deps 1 $map_len
    echo "[[task.request]]"
    cpus=${task_cpus[$task]}
    if [ "$cpus" == "all" ]; then
        echo "resources = { \"cpus\" = \"$cpus\", \"mem\" = \"$node_mem\" }"
    else
        mem=$((cpus*mem_per_cpu))
        echo "resources = { \"cpus\" = \"$cpus\", \"mem\" = \"$mem\" }"
    fi
    echo
    let task_id++
done >>$jobfile

print-yaml-task() {
    local dep_start=$((map_len+1))
    local dep_end=$((task_id-1))
    echo "[[task]]"
    echo "id = $task_id"
    singularity-command /work/scripts/lumi/03.write_yaml.sh $yaml_file_path $lang $corpusname $work_dir/reduce
    print-deps $dep_start $dep_end
    yaml-env
    echo "crash_limit = 1"
    echo "[[task.request]]"
    echo 'resources = { "cpus" = "2", "mem" = "4000" }'
}
print-yaml-task >>$jobfile

set +e
submit_out=$(hq job submit-file --output-mode json $jobfile)
if [ $? -ne 0 ]; then
    echo $submit_out | jq -r .error
    exit 1
fi
set -e
job_id=$(echo $submit_out | jq -r .id)
echo "Job submitted successfully, job ID: $job_id" >&2
