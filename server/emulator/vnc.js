const EventEmitter = require('events');
const util = require('util');
const rfb = require('rfb2');
const fs = require('fs');

function VNC(host, port) {
  EventEmitter.call(this);
  this.host = host;
  this.port = port;
  this.displayNum = port - 5902; // Android Emulator VNC port
  this.state = [];
  this.width = 800;
  this.height = 600;

  this.r = rfb.createConnection({
    host,
    port
  });

  this.r.on('connect', () => {
    console.log('successfully connected to VNC and authorized!');
    console.log(`Remote screen name: ${this.r.title}, Width:
    ${this.r.width}, Height: ${this.r.height}`);
    console.log(this.r);
  });

  this.r.on('rect', this.drawRect.bind(this));
}

util.inherits(VNC, EventEmitter);

VNC.prototype.drawRect = function(rect) {
  if (rect.encoding === undefined) {
    return;
  } else if (rect.encoding === rfb.encodings.copyRect) {
    console.log('copy', rect.src)
    this.emit('copy', rect);
    return;
  } else if (rect.encoding === rfb.encodings.raw) {
    // console.log('raw: ', rect);

    this.emit('raw', {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      redShift: this.r.redShift,
      blueShift: this.r.blueShift,
      greenShift: this.r.greenShift,
      data: rect.data
    });
  }
};

module.exports = VNC;

// emulator -avd Nexus_5_API_23 -no-window -gpu off -cpu-delay 0 -no-boot-anim -qemu -vnc :2
// sudo lsof -i -n -P | grep TCP
// adb kill-server
// docker inspect --format '{{ .NetworkSettings.IPAddress }}'
// clean all containers: docker ps -a | sed '1 d' | awk '{print $1}' | xargs -L1 docker rm
// clean all images: docker images -a | sed '1 d' | awk '{print $3}' | xargs -L1 docker rmi -f
// docker run -it --privileged -P <IMAGE_ID>
// run arbitrary commands inside an existing container: docker exec -it <mycontainer> bash
// https://wiki.archlinux.org/index.php/QEMU#Mouse_integration
// https://github.com/aikinci/droidbox/blob/master/install-fastdroid-vnc.sh
/*
ca-certificates
libreadline-gplv2-dev \
libncursesw5-dev \
libssl-dev \
libsqlite3-dev \
tk-dev \
libgdbm-dev \
libc6-dev \
libbz2-dev \

# Install Python
# RUN wget https://www.python.org/ftp/python/3.4.3/Python-3.4.3.tgz
# RUN tar xzf Python-3.4.3.tgz
# RUN cd Python-3.4.3
# RUN ./configure
# RUN make altinstall

# Install fastdroid VNC server
RUN wget ‐‐directory-prefix=/usr/local/ https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/fastdroid-vnc/fastdroid-vnc

*/
