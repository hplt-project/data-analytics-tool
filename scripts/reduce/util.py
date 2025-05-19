import yaml

def get_fastspell_langs():
    #As extracted from https://fasttext.cc/docs/en/language-identification.html#list-of-supported-languages
    #and left side of https://github.com/mbanon/fastspell/blob/main/src/fastspell/config/similar.yaml
    fasttext_langs="af als am an ar arz as ast av az azb ba bar bcl be bg bh bn bo bpy br bs bxr ca cbk ce \
                    ceb ckb co cs cv cy da de diq dsb dty dv el eml en eo es et eu fa fi fr frr fy ga gd gl \
                    gn gom gu gv he hi hif hr hsb ht hu hy ia id ie ilo io is it ja jbo jv ka kk km kn ko krc \
                    ku kv kw ky la lb lez li lmo lo lrc lt lv mai mg mhr min mk ml mn mr mrj ms mt mwl my myv \
                    mzn nah nap nds ne new nl nn no oc or os pa pam pfl pl pms pnb ps pt qu rm ro ru rue sa sah \
                    sc scn sco sd sh si sk sl so sq sr su sv sw ta te tg th tk tl tr tt tyv ug uk ur uz vec \
                    vep vi vls vo wa war wuu xal xmf yi yo yue zh \
                    awa bho fo fur hbs_lat hbs_cyr hbs iw ltg mag me me_lat me_cyr nb pap sr_cyr sr_lat szl ti zsm"
    return(fasttext_langs.split())


'''
def write_stats(statsfile, statsdict):
    with open(statsfile, "w") as f:
        yaml.dump(statsdict, f)    
'''

'''
# To convert sizes
def convert_size(size_bytes):
   if size_bytes == 0:
       return "0B"
   size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
   i = int(math.floor(math.log(size_bytes, 1024)))
   p = math.pow(1024, i)
   s = round(size_bytes / p, 2)
   return "%s %s" % (s, size_name[i])
'''