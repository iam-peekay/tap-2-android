var EventEmitter = require('events');
var util = require('util');
var sys = require('sys');
var fs = require('fs');
var exec = require('child_process').exec;
var VNC = require('./vnc');
var Canvas = require('canvas');
var net = require('net');

var hostName = process.env.ANDROID_VNC_HOST || '127.0.0.1';
var port = 5902;
var tcp = process.env.ANDROID_TCP || '127.0.0.1:5555';

function Android() {
  if (!(this instanceof Android)) return new Android();
  this.running = false;
}

util.inherits(Android, EventEmitter);

Android.prototype.closed = function() {
  this.running = false;
  setTimeout(this.run, 100);
  return;
};

Android.prototype.run = function() {
  var self = this;

  try {
    this.vnc = new VNC(hostName, port);
  } catch(e) {
    console.log('connection error');
    return self.closed();
  }

  try {
    var split = tcp.split(':');
    var tcpHost = split[0];
    var tcpPort = split[1];
    this.tcp = net.connect({host: tcpHost, port: tcpPort});
    this.tcp.on('end', function() {
      return self.closed();
    });
  } catch(e) {
    console.log('tcp connection error');
    return self.closed();
  }

  this.vnc.on('connect', function() {
    console.log('successfully connected via vnc and authorised');
    fs.writeFile('message.txt', 'Hello Node.js', (err) => {
      if (err) throw err;
      console.log('It\'s arrived via vnc!');
    });
  });

  this.vnc.on('copy', function(rect){
    self.emit('copy', rect);
  });

  this.vnc.on('raw', function(frame){
    self.emit('raw', frame);
  });

  this.vnc.on('frame', function(frame){
    self.emit('frame', frame);
  });

  this.running = true;
};

module.exports = Android;
