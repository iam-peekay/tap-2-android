/* eslint-disable */
/* global URL */

const io = require('socket.io-client');
const socket = io.connect('http://localhost:8000');

socket.on('connect', () => {
  console.log('connection on client');
});

let image = document.getElementById('emulator-window').childNodes[0].nextSibling;
let replaced = false;
let canvas = document.createElement('canvas');
let ctx;

socket.on('raw', function (frameData) {
  if (!frameData) {
    return;
  }

  if (!replaced) {
    let divImage = document.getElementById('emulator-window');
    canvas.width = frameData.width;
    canvas.height = frameData.height;
    divImage.appendChild(canvas); // TODO: need to replace, not append
    replaced = true;
    console.log(canvas, 'canvas');
  }

  ctx = canvas.getContext('2d');

  const imageData = canvas.getContext('2d').createImageData(frameData.width, frameData.height);
  const dataForImage = new Uint8ClampedArray(frameData.data);
  // const dataForImage = new Uint16Array(frameData.data);
  imageData.data.set(dataForImage);

  putImageNew(ctx, frameData.x, frameData.y, imageData);
  // ctx.putImageData(imageData, frameData.x, frameData.y);
});

socket.on('copy', function(rect){
  var imageData = ctx.getImageData(rect.src.x, rect.src.y, rect.width, rect.height);

  ctx.putImageData(imageData, rect.x, rect.y);
});


const putImageNew = (ctx, dx, dy, imageData, dirtyX, dirtyY, dirtyWidth, dirtyHeight) => {
  var data = imageData.data;
  var height = imageData.height;
  var width = imageData.width;
  dirtyX = dirtyX || 0;
  dirtyY = dirtyY || 0;
  dirtyWidth = dirtyWidth !== undefined ? dirtyWidth : width;
  dirtyHeight = dirtyHeight !== undefined ? dirtyHeight : height;
  var limitBottom = dirtyY + dirtyHeight;
  var limitRight = dirtyX + dirtyWidth;
  for (var y = dirtyY; y < limitBottom; y++) {
    for (var x = dirtyX; x < limitRight; x++) {
      var pos = y * width + x;
      var copy1 = data[pos * 2 + 0];
      var copy2 = data[pos * 2 + 1];

      var r = ((copy1 >>> 4) / 15) * 100;
      var g = ((copy1 & 15) / 15) * 100;
      var b = ((copy2 >>> 4) / 15) * 100;
      var a = (copy2 & 15) / 15;
      ctx.fillStyle = 'rgb(' + r + '%'
                        + ',' + g + '%'
                        + ',' + b + '%)';

      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
}

const putImageNew2 = (ctx, dx, dy, imageData, dirtyX, dirtyY, dirtyWidth, dirtyHeight) => {
  var data = imageData.data;
  var height = imageData.height;
  var width = imageData.width;
  dirtyX = dirtyX || 0;
  dirtyY = dirtyY || 0;
  dirtyWidth = dirtyWidth !== undefined ? dirtyWidth : width;
  dirtyHeight = dirtyHeight !== undefined ? dirtyHeight : height;
  var limitBottom = dirtyY + dirtyHeight;
  var limitRight = dirtyX + dirtyWidth;
  for (var y = dirtyY; y < limitBottom; y++) {
    for (var x = dirtyX; x < limitRight; x++) {
      var pos = y * width + x;
      var pixel = data[pos];

      var r = (((pixel >> 11) & 31) * 65535 + 31 / 2) / 31;
      var g = (((pixel >> 5) & 63) * 65535 + 63 / 2) / 63;
      var b = (((pixel >> 0) & 31) * 65535 + 31 / 2) / 31;

      ctx.fillStyle = 'rgb(' + r + '%'
                        + ',' + g + '%'
                        + ',' + b + '%)';

      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
}
