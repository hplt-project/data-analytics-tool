
cd /work/uploaded_corpora/
wget https://huggingface.co/datasets/allenai/MADLAD-400/resolve/main/data/ga/ga_clean_0000.jsonl.gz -O madlad-ga_clean_0000.jsonl.gz
zcat madlad-ga_clean_0000.jsonl.gz | head -n 1000 > madlad_sample.jsonl
rm madlad-ga_clean_0000.jsonl.gz
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/madlad_sample.jsonl yaml_dir/test.mono-madlad.yaml ga - madlad mono
rm uploaded_corpora/madlad_sample.jsonl
