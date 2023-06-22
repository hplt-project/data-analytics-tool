def read_monocleanerscores(corpusname):
    monocleanerscores = "uploaded_corpora/"+corpusname+".monocleaner-classify"
    src, scores = zip(*(line.split("\t") for line in open(monocleanerscores, "r").read().splitlines()))

    buckets = [[] for _ in range(11)]
    for item in scores:
        bucket_index = int(float(item) * 10)
        buckets[bucket_index].append(item)

    bucket_counts = [[i / 10, len(bucket)] for i, bucket in enumerate(buckets)]

    return(bucket_counts)

