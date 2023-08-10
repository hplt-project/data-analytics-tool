#No GPU support needed by now...
FROM ubuntu:22.04

ENV BINPATH=/opt/bin
ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive

RUN mkdir -p /work/
RUN mkdir -p /work/img/
RUN mkdir -p /work/css/
RUN mkdir -p /work/scripts/
RUN mkdir -p /work/uploaded_corpora/  
RUN mkdir -p /work/yaml_dir/

RUN mkdir -p /work/venvs/

#TO DO: uploaded_corpora and yaml_dir should be volumes

COPY deployment/requirements.txt /work/deployment/requirements.txt

RUN apt-get update && \
    apt-get install -y wget unzip joe gcc && \ 
    apt-get install -y python3.10 python3-dev python3.10-dev  python3-pip  python3.10-venv && \
    apt-get install -y git build-essential autoconf autopoint libtool parallel &&\
    apt-get install -y hunspell libhunspell-dev
    
RUN python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools
   
RUN python3.10 -m venv /work/venvs/venv-mc
RUN python3.10 -m venv /work/venvs/venv-bhr
RUN python3.10 -m venv /work/venvs/venv-bc
RUN python3.10 -m venv /work/venvs/venv-bcai

RUN cd /work && git clone https://github.com/ZJaume/tmxt && cd

RUN . /work/venvs/venv-mc/bin/activate && \
    python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install --config-settings="--build-option=--max_order=7" https://github.com/kpu/kenlm/archive/master.zip && \
    python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 &&\
    python3.10 -m pip install monocleaner==1.6.1 && deactivate

RUN . /work/venvs/venv-bhr/bin/activate && \
    python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 &&\
    python3.10 -m pip install --config-settings="--build-option=--max_order=7" https://github.com/kpu/kenlm/archive/master.zip && \
    python3.10 -m pip install bicleaner-hardrules==2.8.1 && deactivate

RUN . /work/venvs/venv-bc/bin/activate && \
    python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install --config-settings="--build-option=--max_order=7" https://github.com/kpu/kenlm/archive/master.zip && \    
    python3.10 -m pip install bicleaner==0.17.2 && deactivate

RUN . /work/venvs/venv-bcai/bin/activate && \
    python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 &&\   
    python3.10 -m pip install --config-settings="--build-option=--max_order=7" https://github.com/kpu/kenlm/archive/master.zip && \
    python3.10 -m pip install bicleaner-ai==2.3 && deactivate

RUN python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 &&\
    python3.10 -m pip install -r /work/deployment/requirements.txt &&\
    echo "import nltk; nltk.download('punkt'); nltk.download('stopwords');" | python3.10

#RUN  python3.10 -m pip install keras tensorflow tensorrt &&\ 
#    echo "import nlpashto; nlpashto.download('word_segment')|python3.10"



COPY *.html /work/
COPY favicon.ico /work/
COPY img/* /work/img/
COPY css/* /work/css/
COPY server.py /work/
COPY scripts/* /work/scripts/

COPY deployment/docker-entrypoint.sh /work/deployment/docker-entrypoint.sh

EXPOSE 8000

RUN chmod +x /work/deployment/*.sh
#CMD ["tail", "-f",  "/dev/null"]
CMD /work/deployment/docker-entrypoint.sh
