const EventEmitter = require('events');
const util = require('util');
const VNC = require('./vnc');
const net = require('net');
const redisEmulatorClient = require('./../redis').emulator();

/*
* An emulator instance occupies a pair of adjacent ports: a console port
* and an adb port. The port numbers differ by 1, with the adb port
* having the higher port number. The console of the first emulator
* instance running on a given machine uses console port 5554 and adb
* port 5555. Subsequent instances use port numbers increasing by two —
* for example, 5556/5557, 5558/5559, and so on. Up to 16 concurrent
* emulator instances can run a console facility.
*/

// Android emulator VNC diplay 2 connects to port 5902
const hostName = process.env.HOST || '127.0.0.1';
const port = process.env.ANDROID_VNC_PORT || 5902;
const tcp = process.env.ANDROID_TCP || '127.0.0.1:5555';
// const hostName = process.env.ANDROID_VNC_HOST || '192.168.99.100';
// const port = process.env.ANDROID_VNC_PORT || 32828;
// const tcp = process.env.ANDROID_TCP || '192.168.99.100:32828';

// Android emulator constructor function
function Android() {
  EventEmitter.call(this);
  if (!(this instanceof Android)) {
    return new Android();
  }
  this.running = false;
}

// Android emulator needs to be an event emitter
util.inherits(Android, EventEmitter);

Android.prototype.closed = () => {
  this.running = false;
  // Restart emulator after 100ms
  setTimeout(this.run, 100);
  return;
};

/*
  Define the "run" method which:
  - Sets up VNC connection
  - Listen to rect events coming from VNC and emit them to itself
  - Then the emulator instance listens to its own events and emits
  to socket.io (see emitter.js)
*/
Android.prototype.run = function() {
  const self = this;
  this.firstFrameReceived = false;
  try {
    this.vnc = new VNC(hostName, port);
  } catch (e) {
    console.log('VNC connection error');
    return self.closed();
  }

  try {
    const split = tcp.split(':');
    const tcpHost = split[0];
    const tcpPort = split[1];
    this.tcp = net.connect({ host: tcpHost, port: tcpPort });
    this.tcp.on('end', () => self.closed());
  } catch (e) {
    console.log('TCP connection error');
    return self.closed();
  }

  this.vnc.on('copy', (rect) => {
    self.emit('copy', rect);
  });

  this.vnc.on('raw', (imageData) => {
    if (this.firstFrameReceived) {
      self.emit('raw', imageData);
    } else {
      self.emit('firstFrame', imageData);
      this.firstFrameReceived = true;
    }
  });

  this.running = true;
  this.destroyed = false;
};

/*
  If there is an error event from the VNC,
  we destroy the instance
*/
Android.prototype.destroy = () => {
  if (this.destroyed) {
    return this;
  }
  this.destroyed = true;
  this.running = false;
  return this;
};

module.exports = Android;
