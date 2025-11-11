# HPLT Analytics
## Set up the container
The pipeline runs on a singularity container that needs to be built.
The HPC most likely will support singularity containers but not building them, so the build has to be done on a local machine and then transfer the file to the HPC.

Clone the repo and compile the container
```
$ git clone https://github.com/hplt-project/data-analytics-tool
$ cd data-analytics-tool
# docker build -t data-analytics-lumi:latest .
# singularity build -f data-analytics.sif data-analytics.def
```
this will need and [singularity](https://docs.sylabs.io/guides/4.3/admin-guide/installation.html#install-from-provided-rpm-deb-packages) installed.

Once built, if running on an HPC, clone the repo there and copy the `.sif` file to the repo root directory.

## Set up HyperQueue
[Install](https://it4innovations.github.io/hyperqueue/stable/installation/) it. To do it in a cluster for a single user, putting it in `~/.local/bin` and adding the directory to `$PATH`, can be a good place.

Then start the server running `hq server start`.
Note that it will take the current shell and be up until it's cancelled (`Cntrl+C`).
For more details about the server deployment look at the [documentation](https://it4innovations.github.io/hyperqueue/stable/deployment/server/)

### Deployment on a local machine
To deploy it in a local machine (single node), just a single worker is needed and can be deployed with `hq worker start`.
After that, HQ is ready for jobs to be submitted.

### Deployment on a cluster
To deploy it on a cluster, it is recommended to use [automatic allocation](https://it4innovations.github.io/hyperqueue/stable/deployment/allocation/).
An example of an automatic allocation queue could be
```
hq alloc add slurm \
    --name datan --max-workers-per-alloc 1 \
    --max-worker-count 200 --backlog 20 \
    --time-limit 72h --idle-timeout 30s \
    --cpus 256 \
    --resource "mem=sum(224000)" \
    -- -p small -A project_account \
    --ntasks 1 \
    --cpus-per-task 128 --mem-per-cpu 1750 \
    -o "/path/to/worker_%x.logs" # Note the use of %x to set the fileneme according to the worker id
```
this queue will submit at most 200 slurm single node jobs and a worker on each node.
The idle timeout is set to 30s, so if a worker does not receive a task within that time, it will finish along with its allocation (slurm job).
Therefore the queue can stay up if no jobs are left because it won't waste resources.
Note that some parameters are particular to LUMI HPC and may be different on other HPCs:
 - The queue allocates at most 200 jobs, which is the limit on small partition.
 - The number of cpus in the slurm parameter is 128, which corresponds to physical cores on LUMI-C. However HQ will detect 256 because of hyper-threading, that's why `--cpus 256` is used.
 - A constraint on the amount of memory each worker should have (224000 MB which is 1750\*128) is added to avoid HQ detecting a higher amount of ram of LUMI if a node with more memory is handed because slurm would OOM kill the HQ job if it uses more memory than requested even if the node has more.
 - The time limit and memory might differ from other clusters.
So please carefully read your HPC documentation about submitting Slurm or PBS jobs.

After this, you can start submitting jobs.

When all jobs are finished, you can close allocation queue with `hq alloc remove <queue_id>` (might need `--force` if there are workers running).
Remember to double check if a queue is already running before you start a new one.
Multiple HQ allocation queues can be used, but if there's one running configured to take all possible resources on a particular Slurm partition, you might run into allocation queue failures.

## Run jobs
To run the pipeline, first configure a few variables on the execution script:
 - `log_dir`: path to store HQ logs and other logs (will be used with `hq output-log` to inspect the logs).
 - `sort_tmp`: default temporary directory is set to `/tmp` but on some clusters this directory is mounted on ram, so please use a directory that has a lot of disk space (on LUMI scratch dir).
 - `node_mem` and `mem_per_cpu`: it is set to the typical LUMI-C nodes, which have 1750MB of ram per physical core, a total of 224000.

After configuring the variables the script can be executed:
```
./scripts/lumi/runstats-hq.sh <lang> <corpus_format> <corpus_name> <yaml_path> <work_dir> [input_files ...]
```
the work directory will be the place where a temporary dir is created for every execution.
```
./scripts/lumi/runstats-hq.sh fr hplt-v3 hplt-v3-fr output_yaml_hplt-v3-fr.yaml path/to/large/disk data/fra_Latn.*.jsonl.zst
```
Note that the script will block until the all jobs are finished to satisfy job dependency.
However, multiple instances can run in parallel.
You might want to run many instances in parallel, one for each dataset+language, on different TMUX or SCREEN tabs.

## Troubleshooting
### Logs
The logs are configured to use [output streaming](https://it4innovations.github.io/hyperqueue/stable/jobs/streaming/) to avoid creating separated log files for each task, therefore many files.
To inspect the logs use the `hq output-log` command.

For example, use `hq output-log <log-dir> cat <job-id> stderr` to look for the `stderr` outputs of all tasks on a job.
Sometimes, if a task has failed, the previous command might fail because there might be other jobs in the task with its output partially written to the logs.
In this case, find the task that failed (`hq job info <job-id>`) and request only the output for that task with `hq output-log <log-dir> cat <job-id> stderr --task <task-id>`.

### Worker crashes
The worker crash limit is set to 1, so if a worker crashes, the task will fail (and the job will also fail if it reaches `max-fails` limit, which is currently 0).
To check if a job failed because a worker crash, use `hq job info <job-id>` and look for tasks failing because a "worker was lost".

One common scenario where a worker might crash is if it went OOM.
To check that, look for the worker that was running on `hq task info <job-id> <task-id>`.
Then in `path/to/worker-<worker-id>.log` look for manager job ID.
Finally query the job manager for the failure reason, for Slurm: `sacct --job <slum-job-id> --long`.

If the worker didn't crash because OOM, it may be just a temporary failure on the HPC, so you can try submitting it again.
