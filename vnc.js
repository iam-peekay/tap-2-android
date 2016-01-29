const EventEmitter = require('events');
const util = require('util');
const rfb = require('rfb2');
const fs = require('fs');
const PNG = require('node-png').PNG;
const Canvas = require('canvas');

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
    console.log('copy', rect.src)
    this.emit('copy', rect);
    return;
  } else if (rect.encoding === rfb.encodings.raw) {
    console.log('raw: ', rect.x, rect.y, rect.width, rect.height, rect.data);

    // var img = encodeFrame(rect).toDataURL();
    var img = drawImage(rect.x, rect.y, rect.width, rect.height, rect.data);

    this.emit('raw', {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      data: rect.data,
      image: img
    });
  }

  if (!this.state) {
    // first frame
    this.state = img;
    this.state.push(img);
    this.emit('frame', img);
  } else {
    this.state.push(img);
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
      ctx.fillStyle = 'rgb(' + imageData[pos * 4 + 0]
                        + ',' + imageData[pos * 4 + 1]
                        + ',' + imageData[pos * 4 + 2] + ')';
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }

  return canvas.toDataURL();
}


function encodeFrame(rect) {
  var rgb = new Buffer(rect.width * rect.height * 3, 'binary');
  var offset = 0;

  for (var i = 0; i < rect.data.length; i += 4) {
    rgb[offset] = rect.data[i + 2];
    offset += 1;
    rgb[offset] = rect.data[i + 1];
    offset += 1;
    rgb[offset] = rect.data[i];
    offset += 1;
  }
  var image = new PNG(rgb, rect.width, rect.height, 'rgb');
  return image;
}


module.exports = VNC;


// emulator -avd Nexus_5_API_23 -no-window -qemu -vnc :2
// sudo lsof -i -n -P | grep TCP
// adb kill-server
