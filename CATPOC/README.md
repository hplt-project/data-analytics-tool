INSTRUCTIONS

1. Start env: source scripts/catpoc-env/bin/activate
2. Install fastspell and bicleaner
3. Make sure the "uploaded_corpora" and "yaml_dir" exist.
4. Start the web server with "python3 server.py"
5. The app is running in localhost:8000. Viewer: localhost:8000/viewer.html Uploader: localhost:8000/uploader.html

TEMPTATIVE ROADMAP

1. ~~Build the simplest stats script (line lenght stats) that generates a yaml from a TSV.~~
2. ~~Build basic HTML viewer that reads a folder filled with yaml files.~~
3. ~~Add fancy graphs/charts to the viewer.~~
4. ~~Basic frontend to process a corpus (upload corpus, provide some metadata)~~
5. ~~Add lang identifier to the stats and the viewer.~~
6. Add bicleaner score to the stats and the viewer.
7. Add some CSS
8. Expand stats: providing an existing metadata yaml must result in only adding the missing fields.
9. Support other formats (TMXs)
10. Replace space splitting with a proper tokenizer
11. Put it all inside a docker
12. Add a proper backend to the viewer
13. Add a proper API/DB
14. Make async
15. Parallel processing of stats
16. Download all yamls button
