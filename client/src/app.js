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
  // const dataForImage = new Uint16Array(imageData.data);
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
  // const dataForImage = new Uint16Array(imageData.data);
  canvasImageData.data.set(dataForImage);

  // Paint imageData to canvas
  putImageNew(ctx, imageData.x, imageData.y, canvasImageData);
});

socket.on('copy', function(rect){
  const canvasImageData = ctx.getImageData(rect.src.x, rect.src.y, rect.width, rect.height);
  ctx.putImageData(canvasImageData, rect.x, rect.y);
});


const putImageNew = (ctx, dx, dy, imageData, dirtyX, dirtyY, dirtyWidth, dirtyHeight) => {
  const data = imageData.data;
  const height = imageData.height;
  const width = imageData.width;
  dirtyX = dirtyX || 0;
  dirtyY = dirtyY || 0;
  dirtyWidth = dirtyWidth !== undefined ? dirtyWidth : width;
  dirtyHeight = dirtyHeight !== undefined ? dirtyHeight : height;
  const limitBottom = dirtyY + dirtyHeight;
  const limitRight = dirtyX + dirtyWidth;
  for (let y = dirtyY; y < limitBottom; y++) {
    for (let x = dirtyX; x < limitRight; x++) {
      let pos = y * width + x;
      // Since we are now using UintClampedArray, we
      // assume that each r, g, b, a sequence takes up
      // 16 bits (i.e. 2 bytes), with R, G, B, A
      // representing 4 bits each
      let copy1 = data[pos * 2 + 0];
      let copy2 = data[pos * 2 + 1];

      // If I reverse the order a, b, g, r vs. r, g, b, a, it
      // looks much closer to the real thing.
      // I assume it must be because it is little endian
      // hmmmm.......
      // Still needs some work, but much closer than before.
      let a = ((copy1 >>> 4) / 15);
      let b = ((copy1 & 15) / 15) * 100;
      let g = ((copy2 >>> 4) / 15) * 100;
      let r = ((copy2 & 15) / 15) * 100;
      ctx.fillStyle = 'rgb(' + r + '%'
                        + ',' + g + '%'
                        + ',' + b + '%)';

      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
}


// TEMPORARY - this is just an experimental function for me
// to try out different formulas for putting image data

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

      var r = (((pixel >> 11) & 31) / 31) * 100;
      var g = (((pixel >> 5) & 63) / 63) * 100;
      var b = (((pixel >> 0) & 31) / 31) * 100;

      // var r = ((((pixel >> 11) & 31) * 65535 + 31 / 2) / 31) * 100;
      // var g = ((((pixel >> 5) & 63) * 65535 + 63 / 2) / 63) * 100;
      // var b = ((((pixel >> 0) & 31) * 65535 + 31 / 2) / 31) * 100;

      ctx.fillStyle = 'rgb(' + r + '%'
                        + ',' + g + '%'
                        + ',' + b + '%)';

      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
}
