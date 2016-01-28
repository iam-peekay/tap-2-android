const EventEmitter = require('events');
const util = require('util');
const rfb = require('rfb2');
const fs = require('fs');
// const exec = require('child_process').exec;
const Canvas = require('canvas');

function VNC(host, port) {
  EventEmitter.call(this);
  this.host = host;
  this.port = port;
  this.displayNum = port - 5902; // Android Emulator VNC port

  this.width = 800;
  this.height = 600;

  this.r = rfb.createConnection({
    host,
    port
  });

  this.r.on('connect', () => {
    console.log('successfully connected to VNC!');
    console.log(`Remote screen name: ${this.r.title}, Width:
    ${this.r.width}, Height: ${this.r.height}`);
  });

  this.r.on('rect', this.drawRect.bind(this));
}

util.inherits(VNC, EventEmitter);

VNC.prototype.drawRect = function(rect) {
  if (rect.encoding === undefined) {
    return;
  } else if (rect.encoding === rfb.encodings.copyRect) {
    this.emit('copy', rect);
    return;
  } else if (rect.encoding === rfb.encodings.raw) {
    console.log('raw: ', rect.x, rect.y, rect.width, rect.height, rect.data);
    this.emit('raw', drawImage(rect.x, rect.y, rect.width, rect.height, rect.data));
  }
};


const drawImage = (dx, dy, width, height, imageData, dirtyX, dirtyY, dirtyWidth, dirtyHeight) => {
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');
  dirtyX = dirtyX || 0;
  dirtyY = dirtyY || 0;
  dirtyWidth = dirtyWidth !== undefined ? dirtyWidth : width;
  dirtyHeight = dirtyHeight !== undefined ? dirtyHeight : height;
  var limitBottom = dirtyY + dirtyHeight;
  var limitRight = dirtyX + dirtyWidth;
  for (var y = dirtyY; y < limitBottom; y++) {
    for (var x = dirtyX; x < limitRight; x++) {
      var pos = y * width + x;
      ctx.fillStyle = 'rgba(' + imageData[pos*4+0]
                        + ',' + imageData[pos*4+1]
                        + ',' + imageData[pos*4+2]
                        + ',' + '1' + ')';

      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }

  // canvas.toBuffer(function(err, buffer){
  //   if (err) throw err;
  //   fs.writeFile(__dirname + '/test.png', buffer);
  // });

  return canvas.toDataURL();
}


module.exports = VNC;
