'''
L=hy; wget -i https://data.hplt-project.org/one/monotext/cleaned/$L"_map".txt && zstdcat $L"_"*.jsonl.zst  | python3.10 update-wds.py  >> yaml_dir/HPLT-docs.$L.yaml
'''


import sys
import json
from collections import Counter
import docscorer

ds = docscorer.DocumentScorer()
docs_scores = Counter()



for jsonline in sys.stdin:
    score = ds.score_document(jsonline, only_final_score=True)
    docs_scores[score] += 1
    
    
docscores_list=[]
for docscore, freq in sorted(docs_scores.items()):
    docscores_list.append([docscore, freq])

print("docs_wds: '" + json.dumps(docscores_list) +"'")