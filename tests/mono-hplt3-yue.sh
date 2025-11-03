
cd /work/uploaded_corpora/
wget https://data.hplt-project.org/three/sorted/yue_Hant/10_1.jsonl.zst -O yue_Hant.jsonl.zst
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/yue_Hant.jsonl.zst  yaml_dir/test.mono-hplt3-yue.yaml yue - hplt3 mono
rm uploaded_corpora/yue_Hant.*



