#No GPU support needed by now...
#from nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04
FROM nvidia/cuda:12.2.2-cudnn8-runtime-ubuntu22.04


ENV BINPATH=/opt/bin
#ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive
ENV LC_ALL=C 

RUN mkdir -p /work/
RUN mkdir -p /work/img/
RUN mkdir -p /work/scripts/
RUN mkdir -p /work/scripts/resources/
RUN mkdir -p /work/uploaded_corpora/  
RUN mkdir -p /work/yaml_dir/
RUN mkdir -p /work/tests/

RUN mkdir -p /work/venvs/
RUN mkdir -p /work/hf_cache/

#TO DO: uploaded_corpora and yaml_dir should be volumes

COPY deployment/requirements.txt /work/deployment/requirements.txt
COPY deployment/requirements-rl.txt /work/deployment/requirements-rl.txt

RUN apt-get update && \
    apt-get install -y wget unzip joe gcc libboost-all-dev cmake && \ 
    apt-get install -y python3.10 python3-dev python3.10-dev  python3-pip  python3.10-venv && \
    apt-get install -y git build-essential autoconf autopoint libtool parallel &&\
    apt-get install -y hunspell libhunspell-dev jq zstd curl cuda-nvvm-12-2 gawk
    
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y --default-toolchain=1.77.2
ENV PATH="/root/.cargo/bin:${PATH}"
ENV HF_HOME=/work/hf_cache

    
RUN python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools
   
RUN python3.10 -m venv /work/venvs/venv-mc
RUN python3.10 -m venv /work/venvs/venv-bhr
RUN python3.10 -m venv /work/venvs/venv-bc
RUN python3.10 -m venv /work/venvs/venv-bcai
RUN python3.10 -m venv /work/venvs/venv-bnlp
RUN python3.10 -m venv /work/venvs/venv-rl

RUN cd /work && git clone https://github.com/ZJaume/tmxt && git clone https://github.com/kpu/preprocess && cd
RUN cd /work/preprocess &&  rm -fr build &&  mkdir build && cd build  && cmake .. && make && cd
RUN cd /work && git clone https://github.com/pablop16n/web-docs-scorer && cd web-docs-scorer && git checkout tags/1.2.0 && python3.10 -m pip install .
RUN cd /work && git clone -b openlid193 https://github.com/zjaume/heli-otr.git && cd heli-otr  && python3 -m  pip install .  && heli-convert 


RUN . /work/venvs/venv-mc/bin/activate && \
    python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install --config-settings="--build-option=--max_order=7" https://github.com/kpu/kenlm/archive/master.zip && \    
    python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 &&\
    python3.10 -m pip install monocleaner==1.6.3 && deactivate

RUN . /work/venvs/venv-bhr/bin/activate && \
    python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 &&\
    python3.10 -m pip install --config-settings="--build-option=--max_order=7" https://github.com/kpu/kenlm/archive/master.zip && \
    python3.10 -m pip install bicleaner-hardrules==2.10.6 &&\
    python3.10 -m pip install "numpy<2" && deactivate

RUN . /work/venvs/venv-bc/bin/activate && \
    python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install --config-settings="--build-option=--max_order=7" https://github.com/kpu/kenlm/archive/master.zip && \    
    python3.10 -m pip install bicleaner==0.17.2 && python3.10 -m pip install numpy==1.26.4 && deactivate

RUN . /work/venvs/venv-bcai/bin/activate && \
    python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 &&\   
    python3.10 -m pip install --config-settings="--build-option=--max_order=7" https://github.com/kpu/kenlm/archive/master.zip && \
    python3.10 -m pip install bicleaner-ai==3.1.0 && deactivate

RUN . /work/venvs/venv-bnlp/bin/activate && \
    python3.10 -m pip install -U pip && \
    python3.10 -m pip install -U wheel && \ 
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 &&\
    python3.10 -m pip install -r /work/deployment/requirements.txt &&\
    cd /work && rm -rf etnltk && git clone https://github.com/robeleq/etnltk.git && cd etnltk && python3.10 -m pip install . &&\
    python3.10 -m pip install bnlp-toolkit==4.0.3 &&\
    echo "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords');" | python3.10
    
RUN . /work/venvs/venv-rl/bin/activate && \
    python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install -r /work/deployment/requirements-rl.txt

RUN . /work/venvs/venv-rl/bin/activate &&   huggingface-cli download TurkuNLP/web-register-classification-multilingual
RUN . /work/venvs/venv-rl/bin/activate &&   huggingface-cli download FacebookAI/xlm-roberta-large
RUN . /work/venvs/venv-rl/bin/activate &&   huggingface-cli download nvidia/multilingual-domain-classifier



RUN python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 &&\
    python3.10 -m pip install -r /work/deployment/requirements.txt &&\
    echo "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords');" | python3.10
  


COPY server.py /work/
COPY scripts/ /work/scripts/
COPY tests/ /work/tests/

#RUN cd /work/web-docs-scorer && git checkout tags/1.0.0 && python3.10 -m pip install .
RUN cd /work && cd etnltk && python3.10 -m pip install .
COPY deployment/docker-entrypoint.sh /work/deployment/docker-entrypoint.sh

EXPOSE 8000

RUN chmod +x /work/deployment/*.sh
RUN chmod +x /work/scripts/*.sh

WORKDIR /work

#CMD ["tail", "-f",  "/dev/null"]
CMD /work/deployment/docker-entrypoint.sh
