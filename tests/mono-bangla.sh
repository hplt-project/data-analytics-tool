
cd /work/uploaded_corpora/

wget https://object.pouta.csc.fi/OPUS-HPLT/v2/mono/bn.txt.gz
gunzip bn.txt.gz
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/bn.txt yaml_dir/test.mono-bangla.yaml bn - tsv mono --no-cache
rm uploaded_corpora/bn.*
