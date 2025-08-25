
cd /work/uploaded_corpora/
wget https://data.hplt-project.org/three/sorted/glg_Latn/10_1.jsonl.zst -O glg_Latn.jsonl.zst
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/glg_Latn.jsonl.zst  yaml_dir/test.mono-hplt3.yaml gl - hplt3 mono
rm uploaded_corpora/glg_Latn.*
