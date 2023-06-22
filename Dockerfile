#No GPU support needed by now...
FROM ubuntu:22.04

ENV BINPATH=/opt/bin
ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive

RUN mkdir -p /work/
RUN mkdir -p /work/scripts/
RUN mkdir -p /work/uploaded_corpora/  
RUN mkdir -p /work/yaml_dir/
#TO DO: uploaded_corpora and yaml_dir should be volumes

COPY deployment/requirements.txt /work/deployment/requirements.txt

RUN apt-get update && \
    apt-get install -y gcc python3.10 python3-dev python3-pip && \
    apt-get install -y git build-essential autoconf autopoint libtool
    
RUN python3.10 -m pip install -U pip  && \
    python3.10 -m pip install -U wheel && \
    python3.10 -m pip install -U setuptools && \
    python3.10 -m pip install git+https://github.com/MSeal/cython_hunspell@2.0.3 && \
    python3.10 -m pip install -r /work/deployment/requirements.txt
   
RUN apt-get purge -y gcc  python3-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf ~/.cache/pip/*


COPY CATPOC/* /work/
COPY CATPOC/scripts/* /work/scripts/

COPY deployment/docker-entrypoint.sh /work/deployment/docker-entrypoint.sh

EXPOSE 8000

RUN chmod +x /work/deployment/*.sh
#CMD ["tail", "-f",  "/dev/null"]
CMD /work/deployment/docker-entrypoint.sh
