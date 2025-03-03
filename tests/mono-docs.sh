
cd /work/uploaded_corpora/
wget https://data.hplt-project.org/two/cleaned/mag_Deva/1.jsonl.zst -O mag_Deva.jsonl.zst
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/mag_Deva.jsonl.zst  yaml_dir/test.mag_Deva.yaml mag - docs mono
rm uploaded_corpora/mag_Deva.*
