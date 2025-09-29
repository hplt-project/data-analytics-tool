import sys
import iso639

lang = sys.argv[1]

if len(lang.strip()) == 2:
    print(lang)
elif lang.strip() == "hbs":
    print("hbs")
else:    
    try:
        langobj = iso639.Lang(lang)       
        if langobj.pt1 == None or langobj.pt1 == "":
            print(lang)
        else:
            print(langobj.pt1)
    except Exception as ex:
        print(lang)



