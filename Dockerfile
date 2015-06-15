FROM ubuntu:14.04

MAINTAINER Jim <jimyeh@vm5.com>

RUN apt-get -qq update
RUN apt-get -yqq install nginx curl git supervisor build-essential

ENV NVM_DIR /nvm
ENV NODE_VERSION iojs
ENV NODE_ENV develop

RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.24.0/install.sh | bash
ADD deployment/nvm_run.sh /
RUN /nvm_run.sh nvm install $NODE_VERSION
RUN /nvm_run.sh nvm alias default $NODE_VERSION
RUN /nvm_run.sh npm install gulp LiveScript node-gyp -g

ADD package.json /dashboard/
RUN /nvm_run.sh npm install --prefix /dashboard
RUN /nvm_run.sh npm dedupe --prefix /dashboard

ADD gulpfile.ls /dashboard/
ADD client /dashboard/client
ADD server /dashboard/server

WORKDIR /dashboard
RUN /nvm_run.sh gulp build

ADD deployment/confs/ /
ADD deployment/run_server.sh /
RUN mkdir /dashboard/log

EXPOSE 80

CMD ["supervisord", "-n"]
