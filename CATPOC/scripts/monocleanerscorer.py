import os
def read_monocleanerscores(corpusname):
    monocleanerscores = corpusname+".monocleaner-classify"
    if not os.path.exists(monocleanerscores):
        return {}

    buckets = [[] for _ in range(10)]

    for line in open(monocleanerscores, "r"):

        score = line.strip()
        try:
            bucket_index = int(float(score) * 10)
            buckets[bucket_index].append(score)
        except IndexError as ex:
            if bucket_index == 10:
                buckets[9].append(score) #score was 1.000, add to last bucket
            else:
                logging.error(ex)

    bucket_counts = [[i / 10, len(bucket)] for i, bucket in enumerate(buckets)]

    return(bucket_counts)

