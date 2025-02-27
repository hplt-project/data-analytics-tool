
cd /work/uploaded_corpora/
wget https://object.pouta.csc.fi/OPUS-tldr-pages/v2023-08-29/moses/ca-es.txt.zip
unzip ca-es.txt.zip
paste tldr-pages.ca-es.es tldr-pages.ca-es.ca > es-ca.tsv
rm ca-es.txt.zip  LICENSE  tldr-pages*  README
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/es-ca.tsv yaml_dir/test.es-ca.yaml es ca tsv parallel
rm uploaded_corpora/es-ca.*
