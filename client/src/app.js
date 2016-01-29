/* eslint-disable */
/* global URL */

const q2 = Queue();
const io = require('socket.io-client');
const socket = io.connect('http://localhost:8000');
const emuWidth = 1080;
const emuHeight = 1920;

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
    canvas.width = emuWidth;
    canvas.height = emuHeight;
    divImage.appendChild(canvas); // TODO: need to replace, not append
    replaced = true;
  }

  ctx = canvas.getContext('2d');
  const imageData = canvas.getContext('2d').createImageData(frameData.width, frameData.height);
  const dataForImage = new Uint8ClampedArray(frameData.data);
  imageData.data.set(dataForImage);

  ctx.putImageData(imageData, frameData.x, frameData.y);
});

socket.on('copy', function(rect){
  var imgData = ctx.getImageData(rect.src.x, rect.src.y, rect.width, rect.height);
  ctx.putImageData(imgData, rect.x, rect.y);
});
