import json

from opusfilter.opusfilter import OpusFilter
from opusfilter.autogen import ConfigurationGenerator
from opusfilter.util import file_open
from opusfilter.classifier import lists_to_dicts
import pandas as pd
from pandas import json_normalize

def get_opusfilter_stats(file_name, src, trg):
    config_gen = ConfigurationGenerator(files=[file_name+'.'+src, file_name+'.'+trg], workdir='.', langs=[src, trg])
    opusfilter_params = {
            'AlphabetRatioFilter': {},
            'LengthRatioFilter.char': {
                'name': 'char',
                'unit': 'char'},
            'LengthRatioFilter.word': {
                'name': 'word',
                'unit': 'word'},
            'NonZeroNumeralsFilter': {},
        }
    score_file = config_gen.add_score([{k.split('.', maxsplit=1)[0]: v} for k, v in opusfilter_params.items()])
    config = config_gen.get_config()
    opusf = OpusFilter(config)
    opusf.execute_steps(overwrite=True)

    with file_open('scores.jsonl.gz', 'r') as scores:
        df = json_normalize([lists_to_dicts(json.loads(line)) for line in scores])

    opusfilter_stats = {}

    for c in df.columns:
        bins = pd.cut(df[c], 10).value_counts().sort_index()
        values = [[str(i)[1:-1].replace(', ', ' - '), int(v)] for i, v in zip(bins.index.to_list(), bins.values)]
        opusfilter_stats[c] = values

    return opusfilter_stats
