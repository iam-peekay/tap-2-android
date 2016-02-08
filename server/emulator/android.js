const EventEmitter = require('events');
const util = require('util');
// const exec = require('child_process').exec;
const VNC = require('./vnc');
const net = require('net');

/*
* An emulator instance occupies a pair of adjacent ports: a console port
* and an adb port. The port numbers differ by 1, with the adb port
* having the higher port number. The console of the first emulator
* instance running on a given machine uses console port 5554 and adb
* port 5555. Subsequent instances use port numbers increasing by two —
* for example, 5556/5557, 5558/5559, and so on. Up to 16 concurrent
* emulator instances can run a console facility.
*/

// Built-in android emulator VNC port.
const hostName = process.env.ANDROID_VNC_HOST || '127.0.0.1';
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

util.inherits(Android, EventEmitter);

Android.prototype.closed = () => {
  this.running = false;
  setTimeout(this.run, 100);
  return;
};

Android.prototype.run = function() {
  const self = this;
  try {
    this.vnc = new VNC(hostName, port);
  } catch (e) {
    console.log('connection error');
    return self.closed();
  }

  try {
    const split = tcp.split(':');
    const tcpHost = split[0];
    const tcpPort = split[1];
    this.tcp = net.connect({ host: tcpHost, port: tcpPort });
    this.tcp.on('end', () => self.closed());
  } catch (e) {
    console.log('tcp connection error');
    return self.closed();
  }

  this.vnc.on('connect', () => {
    self.emit('connect');
    console.log('successfully connected via vnc and authorized');
  });

  this.vnc.on('copy', (rect) => {
    self.emit('copy', rect);
  });

  this.vnc.on('raw', (frame) => {
    self.emit('raw', frame);
  });

  this.vnc.on('frame', (frame) => {
    self.emit('frame', frame);
  });

  this.running = true;
};

module.exports = Android;
