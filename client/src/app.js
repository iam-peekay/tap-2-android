/* eslint-disable */
/* global URL */

const io = require('socket.io-client');
const socket = io.connect('http://localhost:8000');

let button = document.getElementById('script');
button.addEventListener('click', function() {
    socket.emit('userInput');
});

socket.on('connect', () => {
  console.log('connection on client');
});

let replaced = false;
let canvas = document.getElementById('canvas');
let ctx;

socket.on('firstFrame', function (imageData) {
  if (!imageData) {
    return;
  }
  // Set up canvas properties & context
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx = canvas.getContext('2d');

  // Tranform canvas imageData
  const canvasImageData = canvas.getContext('2d').createImageData(imageData.width, imageData.height);
  const dataForImage = new Uint8ClampedArray(imageData.data);
  // const dataForImage = new Uint16Array(frameData.data);
  canvasImageData.data.set(dataForImage);

  // Paint imageData to canvas
  putImageNew(ctx, imageData.x, imageData.y, canvasImageData);
});

socket.on('raw', function (imageData) {
  if (!imageData) {
    return;
  }

  // Set up canvas context
  ctx = canvas.getContext('2d');

  // Tranform canvas imageData
  const canvasImageData = canvas.getContext('2d').createImageData(imageData.width, imageData.height);
  const dataForImage = new Uint8ClampedArray(imageData.data);
  // const dataForImage = new Uint16Array(frameData.data);
  canvasImageData.data.set(dataForImage);

  // Paint imageData to canvas
  putImageNew(ctx, imageData.x, imageData.y, canvasImageData);
  // ctx.putImageData(canvasImageData, imageData.x, imageData.y);
});

socket.on('copy', function(rect){
  const canvasImageData = ctx.getImageData(rect.src.x, rect.src.y, rect.width, rect.height);
  ctx.putImageData(canvasImageData, rect.x, rect.y);
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

      // var r = (((pixel >> 11) & 31) / 31) * 100;
      // var g = (((pixel >> 5) & 63) / 63) * 100;
      // var b = (((pixel >> 0) & 31) / 31) * 100;

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
