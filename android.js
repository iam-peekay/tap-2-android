const EventEmitter = require('events');
const util = require('util');
const sys = require('sys');
const fs = require('fs');
const exec = require('child_process').exec;
const VNC = require('./vnc');
const Canvas = require('canvas');
const net = require('net');

const hostName = process.env.ANDROID_VNC_HOST || '127.0.0.1';
const port = 5902;
const tcp = process.env.ANDROID_TCP || '127.0.0.1:5555';

function Android() {
  if (!(this instanceof Android)) return new Android();
  this.running = false;
}

util.inherits(Android, EventEmitter);

Android.prototype.closed = () => {
  this.running = false;
  setTimeout(this.run, 100);
  return;
};

Android.prototype.run = () => {
  const self = this;

  try {
    this.vnc = new VNC(hostName, port);
  } catch(e) {
    console.log('connection error');
    return self.closed();
  }

  try {
    const split = tcp.split(':');
    const tcpHost = split[0];
    const tcpPort = split[1];
    this.tcp = net.connect({host: tcpHost, port: tcpPort});
    this.tcp.on('end', () => {
      return self.closed();
    });
  } catch(e) {
    console.log('tcp connection error');
    return self.closed();
  }

  this.vnc.on('connect', () => {
    console.log('successfully connected via vnc and authorised');
    fs.writeFile('message.txt', 'Hello Node.js', (err) => {
      if (err) throw err;
      console.log('It\'s arrived via vnc!');
    });
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
