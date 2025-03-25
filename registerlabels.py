import logging
import json
import torch
from datasets import load_dataset
from transformers import AutoModelForSequenceClassification, AutoTokenizer

#supported languages; https://github.com/facebookresearch/fairseq/tree/main/examples/xlmr

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Running on " + str(device))

model_id = "TurkuNLP/multilingual-web-register-classification"

# Load model and tokenizer
model = AutoModelForSequenceClassification.from_pretrained(model_id).to(device)
print("Model loaded")
tokenizer = AutoTokenizer.from_pretrained("xlm-roberta-large")
print("Tokenizer loaded")

THRESHOLD = 0.5

classes = {
    "MT": 0,  #Treating this class differently (won't count as MIX when found with another label)
    
    "LY_other": 0,
    
    "SP_other": 0,
    "SP_it": 0,
    
    "ID_other": 0,
    
    "NA_other" : 0,
    "NA_ne": 0,
    "NA_sr": 0,
    "NA_nb": 0,
    
    "HI_other": 0,
    "HI_re": 0,
    
    "IP_other": 0,
    "IP_ds": 0,
    "IP_ed": 0,
    
    "IN_other": 0,
    "IN_en": 0, 
    "IN_ra": 0,
    "IN_dtp": 0,
    "IN_fi": 0,
    "IN_lt": 0,
    
    "OP_other": 0,
    "OP_rv": 0,
    "OP_ob": 0,
    "OP_rs": 0,
    "OP_av": 0,
    
    "MIX": 0,
    
    "UNK": 0
    }


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


#POSSIBLE SCENARIOS:        
def refine_labels(filtered_labels):
        #MT label is treated independently
        if "MT" in filtered_labels:
            classes["MT"] += 1
            filtered_labels.remove("MT")
            logging.debug("MT")


        #No matching registers --> UNK
        if len(filtered_labels) == 0:
            classes["UNK"] += 1
            logging.debug("UNK")
            return

        #Many matching registers --> MIX
        main_labels = set([get_main_class(label) for label in filtered_labels])
        if len(main_labels) > 1:
            classes["MIX"] += 1
            logging.debug("MIX")
            return

        #Only one main register at this point
        raw_classes = [get_class(label) for label in filtered_labels] 

        #only one label -->  return the label
        if len(raw_classes) == 1:
            logging.debug(raw_classes[0])
            classes[raw_classes[0]] += 1
            return

        subclasses = [cls.split("_")[1] for cls in raw_classes]
        subclasses_main = []
        if "other" in subclasses:
            subclasses_main = ["other"]
            subclasses.remove("other")

        #two labels, one is a parent of the other --> return child     
        if len(subclasses_main) == 1 and len(subclasses) == 1:
            final_label = get_main_class(subclasses[0]) + "_" + subclasses[0]
            logging.debug(final_label)
            classes[final_label] += 1
            return

        #more than two labels in total (by definition, at least two of them are siblings)--> return the main label (regardless it is or it is not in the list) 
        if len(subclasses) > 1:
            #take the first one for example
            final_label = get_main_class(subclasses[0]) + "_other"
            logging.debug(final_label)
            classes[final_label]+= 1
            return

        print(" =============== YOU SHOULD NOT BE READING THIS ====================")


with open("ast_Latn.jsonl") as dataset:
    for item in dataset:
        dic = json.loads(item)
        doc = dic.get("text")
        
        # Tokenize text
        inputs = tokenizer([doc], return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
        
        with torch.no_grad():
            outputs = model(**inputs)
            
        # Apply sigmoid to the logits to get probabilities
        probabilities = torch.sigmoid(outputs.logits).squeeze()
        
        predicted_label_indices = (probabilities>THRESHOLD).nonzero(as_tuple=True)[0]
        
        # Extract readable labels using id2label
        id2label = model.config.id2label
        predicted_labels = [id2label[idx.item()] for idx in predicted_label_indices]
        
        refine_labels(predicted_labels)
    

print(classes)



#ace_Arab: 
#register_labels: '{"MT":9,"LY_other":0,"SP_other":0,"SP_it":0,"ID_other":1,"NA_other":0,"NA_ne":0,"NA_sr":0,"NA_nb":0,"HI_other":0,"HI_re":0,"IP_other":0,"IP_ds":2,"IP_ed":0,"IN_other":0,"IN_en":0,"IN_ra":0,"IN_dtp":0,"IN_fi":0,"IN_lt":0,"OP_other":0,"OP_rv":0,"OP_ob":0,"OP_rs":0,"OP_av":0,"MIX":0,"UNK":13}'
