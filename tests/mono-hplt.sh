
cd /work/uploaded_corpora/
wget https://data.hplt-project.org/two/cleaned/gla_Latn/1.jsonl.zst -O gla_Latn.jsonl.zst
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/gla_Latn.jsonl.zst  yaml_dir/test.mono-hplt.yaml gd - hplt2 mono
rm uploaded_corpora/gla_Latn.*
