
cd /work/uploaded_corpora/
wget https://data.hplt-project.org/two/cleaned/ast_Latn/1.jsonl.zst -O ast_Latn.jsonl.zst
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/ast_Latn.jsonl.zst  yaml_dir/test.ast_Latn.lite.yaml ast - docs mono --lite --skip-register-labels
rm uploaded_corpora/ast_Latn.*
