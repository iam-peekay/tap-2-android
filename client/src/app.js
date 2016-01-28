/* eslint-disable new-cap */
/* eslint-disable */
/* global URL */

// import blobToImage from 'blob';
import Queue from './Queue.js';
const q2 = Queue();
const io = require('socket.io-client');
const socket = io.connect('http://localhost:8000');
const emuWidth = 800;
const emuHeight = 600;

function blobToImage(imageData) {
  let image;
  if (imageData.base64) {
    image = `data:image/jpeg;base64${imageData.data}`;
  } else {
    image = 'about:blank';
  }

  return image;
}

socket.on('connect', () => {
  console.log('connection on client');
});

const image = document.getElementById('canvas');

socket.on('raw', function (frameData) {
  if (!frameData) {
    return;
  }

  console.log(frameData);
  image.src = frameData.image;
  console.log(image);
});

// socket.on('raw', function (frame) {
//   const src = blobToImage(frame.image);
//   if (!src) {
//     return;
//   }
//
//   let replaced = false;
//   const img = document.createElement('img');
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');
//   img.onload = () => {
//     if (!replaced) {
//       canvas.width = emuWidth;
//       canvas.height = emuHeight;
//       image.replaceWith(canvas);
//       replaced = true;
//       ctx.drawImage(img, frame.x, frame.y);
//       console.log('ctx', ctx);
//     }
//
//     if (typeof URL !== 'undefined') {
//       URL.revokeObjectURL(src);
//     }
//   };
//   img.src = src;
//   console.log('img', img);
// });
