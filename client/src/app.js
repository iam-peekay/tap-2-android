/* eslint-disable new-cap */
/* eslint-disable */
/* global URL */

// import blobToImage from 'blob';
import Queue from './Queue.js';
const q2 = Queue();
const io = require('socket.io-client');
const socket = io.connect('http://localhost:8000');
const emuWidth = 1080;
const emuHeight = 1920;
const pixelUtil = require('pixel-util');

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
    divImage.appendChild(canvas);
    replaced = true;
  }

  ctx = canvas.getContext('2d');
  const imageData = canvas.getContext('2d').createImageData(frameData.width, frameData.height);
  const dataForImage = new Uint8ClampedArray(frameData.data);
  imageData.data.set(dataForImage);

  ctx.putImageData(imageData, frameData.x, frameData.y);
  console.log(imageData, ctx);

  // drawImage(canvas, frameData);
});

socket.on('copy', function(rect){
  var imgData = ctx.getImageData(rect.src.x, rect.src.y, rect.width, rect.height);
  ctx.putImageData(imgData, rect.x, rect.y);
});


function drawImage(canvas, frameData) {
  var src = blobToImage(frameData.image);
  console.log(src, 'src');
  if (!replaced) {
    let divImage = document.getElementById('emulator-window');
    canvas.width = emuWidth;
    canvas.height = emuHeight;
    divImage.appendChild(canvas);
    replaced = true;
  }

  let img = new Image();

  img.onload = function() {
    console.log('got here');
    ctx = canvas.getContext('2d');
    ctx.drawImage(img, frameData.x, frameData.y);
  };


  // let imageUrl = bufferToImage(frameData.data);
  // img.src = frameData.image;
  img.src = src;

  if (typeof URL !== 'undefined') {
    URL.revokeObjectURL(src);
  }

  img.onerror = function(error) {
    console.log(error, "ERROR");
  }
}

function bufferToImage(arrayBuffer) {
    // Obtain a blob: URL for the image data.
    var arrayBufferView = new Uint8Array(arrayBuffer);
    var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
};

function blobToImage(imageData) {
  let image;
  if (Blob && typeof URL !== 'undefined') {
    const blob = new Blob([imageData], { type: 'image/jpeg' });
    image = URL.createObjectURL(blob);
  } else if (imageData.base64) {
    image = `data:image/jpeg;base64${imageData.data}`;
  } else {
    image = 'about:blank';
  }

  return image;
}
