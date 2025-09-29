import sys
import contextlib
import logging


# Logging config
def logging_setup(args = None):
    
    logger = logging.getLogger()
    logger.handlers = [] # Removing default handler to avoid duplication of log messages
    logger.setLevel(logging.ERROR)
    
    h = logging.StreamHandler(sys.stderr)
    if args != None:
       h = logging.StreamHandler(args.logfile)
      
    h.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    logger.addHandler(h)

    #logger.setLevel(logging.INFO)
    
    if args != None:
        if not args.quiet:
            logger.setLevel(logging.WARNING)
        if args.debug:
            logger.setLevel(logging.DEBUG)

    logging_level = logging.getLogger().level
    if logging_level <= logging.WARNING and logging_level != logging.DEBUG:
        logging.getLogger("ToolWrapper").setLevel(logging.WARNING)
        
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



@contextlib.contextmanager
def stdout_to_err():
    save_stdout = sys.stdout
    sys.stdout = sys.stderr
    yield
    sys.stdout = save_stdout
    
def print_in_column(col, array_items, output):
    for item in array_items:
        for i in range(col-1):
            output.write("\t")

        output.write(item+"\n")

def is_main_class(label):
    return (label in  ["LY",  "SP", "ID", "NA", "HI", "IP", "IN", "OP"])     
    
def get_main_class(label):
    #if label in ["MT"]: return "MT"
    if label in ["LY"]: return "LY"
    if label in ["it", "SP"]: return "SP"
    if label in ["ID"]: return "ID"
    if label in ["ne", "sr", "nb", "NA"]: return "NA"
    if label in ["re", "HI"]: return "HI"
    if label in ["ds", "ed", "IP"]: return "IP"
    if label in ["en", "ra", "dtp", "fi", "lt", "IN"]: return "IN"
    if label in ["rv", "ob", "rs", "av", "OP"]: return "OP"
    raise ValueError("Unknown label: " + label)


def get_class(label):
    if is_main_class(label):
        return label + "_other"
    else:
        return get_main_class(label) + "_" + label


def refine_labels(filtered_labels):
        #MT label is treated independently
        refined_labels = []
        if "MT" in filtered_labels:
            #classes["MT"] += 1
            filtered_labels.remove("MT")
            logging.debug("MT")
            refined_labels.append("MT")


        #No matching registers --> UNK
        if len(filtered_labels) == 0:
            #classes["UNK"] += 1
            logging.debug("UNK")
            refined_labels.append("UNK")
            return refined_labels

        #Many matching registers --> MIX
        main_labels = set([get_main_class(label) for label in filtered_labels])
        if len(main_labels) > 1:
            #classes["MIX"] += 1
            logging.debug("MIX")
            refined_labels.append("MIX")
            return refined_labels

        #Only one main register at this point
        raw_classes = [get_class(label) for label in filtered_labels] 

        #only one label -->  return the label
        if len(raw_classes) == 1:
            logging.debug(raw_classes[0])
            #classes[raw_classes[0]] += 1
            refined_labels.append(raw_classes[0])
            return refined_labels

        subclasses = [cls.split("_")[1] for cls in raw_classes]
        subclasses_main = []
        if "other" in subclasses:
            subclasses_main = ["other"]
            subclasses.remove("other")

        #two labels, one is a parent of the other --> return child     
        if len(subclasses_main) == 1 and len(subclasses) == 1:
            final_label = get_main_class(subclasses[0]) + "_" + subclasses[0]
            logging.debug(final_label)
            #classes[final_label] += 1
            refined_labels.append(final_label)
            return refined_labels

        #more than two labels in total (by definition, at least two of them are siblings)--> return the main label (regardless it is or it is not in the list) 
        if len(subclasses) > 1:
            #take the first one for example
            final_label = get_main_class(subclasses[0]) + "_other"
            logging.debug(final_label)
            #classes[final_label]+= 1
            refined_labels.append(final_label)
            return refined_labels

        logging.error(" =============== YOU SHOULD NOT BE READING THIS ====================")


