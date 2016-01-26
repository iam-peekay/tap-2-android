const Canvas = require('canvas');
const EventEmitter = require('events');
const util = require('util');
const rfb = require('rfb2');
const exec = require('child_process').exec;
const fs = require('fs');

function VNC(host, port) {
  EventEmitter.call(this);
  this.host = host;
  this.port = port;
  this.displayNum = port - 5902; // vnc convention

  this.width = 800;
  this.height = 600;

  this.r = rfb.createConnection({
    host: host,
    port: port
  });

  var self = this;
  this.r.on('rect', this.drawRect.bind(this));
}

util.inherits(VNC, EventEmitter);

VNC.prototype.drawRect = (rect) => {
 // TODO:
 console.log(rect);
};

module.exports = VNC;
