# Start with ubuntu 14.04
FROM ubuntu:14.04

MAINTAINER preethi kasireddy iam.preethi.k@gmail.com

# Specially for SSH access and port redirection
ENV ROOTPASSWORD android

# Expose Node and ZeroRPC server ports
EXPOSE 8000
EXPOSE 4242

# Install ZeroRPC dependencies
RUN apt-get install -y \
    build-essential \
    checkinstall \
    libzmq-dev \
    libevent \
    python-pip \
    python-setuptools

# Install Node, npm
RUN apt-get install -y \
    nodejs \
    npm

# Install ZeroRPC
RUN pip install pyzmq
RUN pip install zerorpc
RUN npm install -g zerorpc

# Create app directory
RUN mkdir -p /usr/src/tap-to-android
WORKDIR /usr/src/tap-to-android

# Install app dependencies
COPY package.json /usr/src/tap-to-android/
RUN npm install

# Bundle app source
COPY . /usr/src/tap-to-android

CMD [ "npm", "start" ]
