
cd /work/uploaded_corpora/
wget https://object.pouta.csc.fi/OPUS-TED2020/v1/moses/en-eo.txt.zip
unzip en-eo.txt.zip
rm en-eo.txt.zip  LICENSE   README
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/TED2020.en-eo yaml_dir/test.parallel-bic-xx.yaml en eo bitext parallel
rm uploaded_corpora/TED2020.*
