/* eslint-disable new-cap */
/* eslint-disable */
/* global URL */

// import blobToImage from 'blob';
import Queue from './Queue.js';
const q2 = Queue();
const io = require('socket.io-client');
const socket = io.connect('http://localhost:8000');
const emuWidth = window.innerWidth;
const emuHeight = window.innerHeight;

socket.on('connect', () => {
  console.log('connection on client');
});

let image = document.getElementById('emulator-window').childNodes[0].nextSibling;
let replaced = false;
let canvas;
let ctx;

socket.on('raw', function (frameData) {
  let divImage = document.getElementById('emulator-window');
  if (!frameData) {
    return;
  }

  if (!replaced) {
    canvas = document.createElement('canvas');
    canvas.width = emuWidth;
    canvas.height = emuHeight;
    divImage.appendChild(canvas);
    replaced = true;
  }

  drawImage(canvas, frameData);
});

io.on('copy', function(rect){
  var imgData = ctx.getImageData(rect.src.x, rect.src.y, rect.width, rect.height);
  ctx.putImageData(imgData, rect.x, rect.y);
});

function drawImage(canvas, frameData) {
  let img = new Image();
  img.onload = function() {
    console.log('got here');
    ctx = canvas.getContext('2d');
    ctx.drawImage(img, frameData.x, frameData.y);
  };

  let imageUrl = bufferToImage(frameData.data);
  img.src = imageUrl;
}

function bufferToImage(arrayBuffer) {
    // Obtain a blob: URL for the image data.
    var arrayBufferView = new Uint8Array(arrayBuffer);
    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
};

function blobToImage(imageData) {
  let image;
  if (imageData.base64) {
    image = `data:image/jpeg;base64${imageData.data}`;
  } else {
    image = 'about:blank';
  }

  return image;
}
