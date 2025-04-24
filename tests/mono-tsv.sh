
cd /work/uploaded_corpora/
wget https://object.pouta.csc.fi/OPUS-GlobalVoices/v2018q4/mono/my.txt.gz
gunzip my.txt.gz
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/my.txt yaml_dir/test.mono-tsv.yaml my - tsv mono --no-cache
rm uploaded_corpora/my.*
