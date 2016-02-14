# Start with ubuntu 14.04
FROM ubuntu:14.04

MAINTAINER preethi kasireddy iam.preethi.k@gmail.com

# Specially for SSH access and port redirection
ENV ROOTPASSWORD android

# Expose Node, ZeroRPC, Redis server ports
EXPOSE 8000
EXPOSE 4242
EXPOSE 6379

# Update packages
RUN apt-get -y update

# Install ZeroRPC dependencies
RUN apt-get install -y python3-software-properties \
    software-properties-common \
    build-essential \
    make \
    curl \
    wget \
    checkinstall \
    libevent-dev \
    libffi-dev \
    libncurses-dev \
    libyaml-dev \
    libpq-dev \
    libzmq3-dev \
    libcairo2-dev \
    libjpeg-dev \
    libgif-dev \
    pkg-config \
    libtool \
    automake \
    uuid-dev \
    autoconf

# Install python tools
RUN apt-get install -y python-pip \
    python-setuptools \
    python-dev

# Install androidViewClient
RUN easy_install --upgrade androidviewclient

# Install Node, npm
RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN apt-get install -y nodejs

#RUN rm /usr/bin/node
#RUN ln -s `which nodejs` /usr/bin/node


# Install ZeroRPC
RUN pip install pyzmq
RUN pip install zerorpc
RUN npm install -g zerorpc
RUM npm install -g redis

# Create app directory
RUN mkdir -p /usr/src/tap-to-android
WORKDIR /usr/src/tap-to-android

# Install app dependencies
COPY package.json /usr/src/tap-to-android/
RUN npm install

# Bundle app source
COPY . /usr/src/tap-to-android

CMD ["npm", "start"]
