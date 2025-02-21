
cd /work/uploaded_corpora/
wget https://object.pouta.csc.fi/OPUS-ELRC-5190-Cyber_MT_Test/v1/tmx/en-es.tmx.gz
gunzip en-es.tmx.gz
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/en-es.tmx yaml_dir/test.en-es.yaml en es tmx parallel
rm /work/uploaded_corpora/en-es*