var Canvas = require('canvas');
var EventEmitter = require('events');
var util = require('util');
var rfb = require('rfb2');
var exec = require('child_process').exec;
var fs = require('fs');

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

VNC.prototype.drawRect = function(rect) {
 // TODO:
 console.log(rect);
};

module.exports = VNC;
