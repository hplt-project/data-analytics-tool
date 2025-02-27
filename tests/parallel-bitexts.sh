
cd /work/uploaded_corpora/
wget https://object.pouta.csc.fi/OPUS-ECDC/v2016-03-16/moses/fr-is.txt.zip
unzip fr-is.txt.zip
rm fr-is.txt.zip  LICENSE   README
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/ECDC.fr-is yaml_dir/test.fr-is.yaml fr is bitext parallel
rm uploaded_corpora/ECDC.*
