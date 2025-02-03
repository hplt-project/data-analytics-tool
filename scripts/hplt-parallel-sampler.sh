
for trg in af ar az be bg bn bs ca cy et eu fa ga gl gu he hi hr is ja kk kn ko lt lv mk ml mr ms mt nb ne si sk sl sq sr sw ta te th tr uk ur uz vi xh
do 
	echo Sampling $trg ...
	zstdcat uploaded_corpora/$trg-en.archivebot-cc13-cc14-cc15-cc16-cc17-cc18-cc19-cc20-cc21-cc22-cc23-survey3-wide10-wide11-wide12-wide15-wide16-wide17-wide5-wide6.tmx.gz | python3 ./tmxt/tmxt.py --codelist=en,$trg,score-bicleaner | shuf -n 50 > uploaded_corpora/sample.en-$trg
done
exit
#zstdcat uploaded_corpora/af-en.archivebot-cc13-cc14-cc15-cc16-cc17-cc18-cc19-cc20-cc21-cc22-cc23-survey3-wide10-wide11-wide12-wide15-wide16-wide17-wide5-wide6.tmx.gz  | python3 ./tmxt/tmxt.py  --codelist=en,af  | shuf -n 10