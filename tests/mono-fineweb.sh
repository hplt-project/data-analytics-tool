
cd /work/uploaded_corpora/
wget https://huggingface.co/datasets/HuggingFaceFW/fineweb-2/resolve/main/data/ast_Latn/train/000_00000.parquet -O fineweb-ast_Latn.parquet
cd ..
bash /work/scripts/runstats.sh uploaded_corpora/fineweb-ast_Latn.parquet  yaml_dir/test.mono-fineweb.yaml ast - fineweb mono
rm uploaded_corpora/fineweb*
