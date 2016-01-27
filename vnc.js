const EventEmitter = require('events');
const util = require('util');
const rfb = require('rfb2');
// const exec = require('child_process').exec;
const Canvas = require('canvas');
// const Image = Canvas.Image;

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
// TODO: Implement draw rect: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
VNC.prototype.drawRect = function(rect) {
  switch (rect.encoding) {
    case rfb.encodings.raw:
      // rect.x, rect.y, rect.width, rect.height, rect.data
      // pixmap format is in r.bpp, r.depth, r.redMask, greenMask,
      // blueMask, redShift, greenShift, blueShift
      console.log('raw: ', rect.x, rect.y, rect.width, rect.height, rect.data);
      this.emit('raw', {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        // image: img
      });
      break;
    case rfb.encodings.copyRect:
      // pseudo-rectangle
      // copy rectangle from rect.src.x, rect.src.y, rect.width,
      // rect.height, to rect.x, rect.y
      console.log('copy of rect: ', rect.width, rect.height, rect.x, rect.y);
      break;
    default:
      return 'No encoding';
  }
};

// TODO
// const drawImage = (x, y) => {
//   const canvas = new Canvas(x, y);
//   const ctx = canvas.getContext('2d');
//   console.log('<img src="' + canvas.toDataURL() + '" />');
// }


module.exports = VNC;
