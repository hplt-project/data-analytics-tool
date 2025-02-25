import os
import json
import yaml
import pandas as pd
import plotly.express as px


raw_labels_dir = "raw/"
clean_labels_dir = "clean/"

langs = os.listdir(raw_labels_dir.strip("/"))
langs.sort()

def get_subregister(reg):
    try:
        ret = reg.split("_")[1]
    except IndexError:
        ret = ""
    return ret


def fullname(reg):
    if reg == "MT": return "Machine-translated"
    if reg == "LY": return "Lyrical"
    if reg == "SP": return "Spoken"
    if reg == "it": return "Interview (SP_it)"
    if reg == "ID": return "Interactive discussion"
    if reg == "NA": return "Narrative"
    if reg == "ne": return "News report (NA_ne)" 
    if reg == "sr": return "Sports report (NA_sr)"
    if reg == "nb": return "Narrative blog (NA_nb)"
    if reg == "HI": return "How-to or instructions"
    if reg == "re": return "Recipe (HI_re)"
    if reg == "IP": return "Informational persuasion"
    if reg == "ds": return "Description with intention to sell (IP_ds)"
    if reg == "ed": return "News & opinion blog or editorial (IP_ed)"
    if reg == "IN": return "Informational description"
    if reg == "en": return "Encyclopedia article (IN_en)"
    if reg == "ra": return "Research article (IN_ra)"
    if reg == "dtp": return "Description of a thing or person (IN_dtp)"
    if reg == "fi": return "FAQ (IN_fi)"
    if reg == "lt": return "Legal terms & conditions (IN_lt)"
    if reg == "OP": return "Opinion"
    if reg == "rv": return "Review (OP_rv)"
    if reg == "ob": return "Opinion blog (OP_ob)"
    if reg == "rs": return "Denominational religious blog or sermon (OP_rs)"
    if reg == "av": return "Advice (OP_av)"
    if reg == "other": return "Other"
    if reg == "MIX": return "Mixed"
    if reg == "UNK": return "Unknown"
    return "-" #This should never happen
    
joint_df = pd.DataFrame()

for lang in langs:
    raw_labels_file = raw_labels_dir + lang
    clean_labels_file = clean_labels_dir + lang + ".jsonl"
    
    #raw and clean labels could be handled sequentially, kept zipped because of legacy reasons
    with open(raw_labels_file, "r") as raw_labels, open(clean_labels_file, "r") as clean_labels:
        raw_labels_yaml = yaml.safe_load(raw_labels)
        clean_labels_yaml = yaml.safe_load(clean_labels)
        
        #print(raw_labels_yaml.get("register_labels"))
        #print(clean_labels_yaml.get("register_labels"))

        raw_dict_data = json.loads(raw_labels_yaml.get("register_labels"))
        clean_dict_data = json.loads(clean_labels_yaml.get("register_labels"))
        
        
        raw_total = sum(raw_dict_data.values()) - raw_dict_data.get("MT")
        clean_total = sum(clean_dict_data.values()) - clean_dict_data.get("MT")

        #wide format
        raw_pandas_data = pd.DataFrame([raw_dict_data])
        clean_pandas_data = pd.DataFrame([clean_dict_data])
        
        #print(raw_pandas_data)
        #print(clean_pandas_data)

        #convert to long, tidy format     
        raw_df = pd.melt(raw_pandas_data)#df, id_vars='team', value_vars=['points', 'assists', 'rebounds']
        raw_df["register"] = raw_df["variable"].apply(lambda x: x.split("_")[0])
        raw_df["subregister"] = raw_df["variable"].apply(lambda x: get_subregister(x))        
        raw_df["register_full"] = raw_df["register"].apply(lambda x: fullname(x))
        raw_df["subregister_full"] = raw_df["subregister"].apply(lambda x: fullname(x))
        raw_df["percent"] = raw_df["value"].apply(lambda x: x*100/raw_total)
        raw_df["lang"] = lang
        raw_df["set"] = "raw"
                                
        clean_df = pd.melt(clean_pandas_data)#df, id_vars='team', value_vars=['points', 'assists', 'rebounds']
        clean_df["register"] = clean_df["variable"].apply(lambda x: x.split("_")[0])
        clean_df["subregister"] = clean_df["variable"].apply(lambda x: get_subregister(x))    
        clean_df["register_full"] = clean_df["register"].apply(lambda x: fullname(x))
        clean_df["subregister_full"] = clean_df["subregister"].apply(lambda x: fullname(x))
        clean_df["percent"] = clean_df["value"].apply(lambda x: x*100/clean_total)            
        clean_df["lang"] = lang
        clean_df["set"] = "clean"

        joint_df = pd.concat([joint_df, raw_df, clean_df])
         
         



fig = px.bar(joint_df, x="register", y="percent", color="subregister", title="HPLT V2 register labels (raw vs clean)", facet_row="lang", facet_col="set", facet_row_spacing=0.002, facet_col_spacing=0.02, height=20000, custom_data=["register_full", "subregister_full", "value"])

fig.for_each_annotation(lambda a: a.update(text=a.text.split("=")[1])) #Display nicer titles
fig.update_xaxes(matches=None, showticklabels=True) #Display X axes labels on all facets
fig.update_yaxes(matches=None, showticklabels=True, range=[0,100]) #Display fixed Y axes labels on all facets
fig.update_traces(textposition='inside', hovertemplate = "Registry: %{customdata[0]} <br>Subregister: %{customdata[1]} </br>Documents: %{customdata[2]} <br>") #custom hover info

fig.show(height=20000)
fig.write_html("registerlabels-plots.html")
