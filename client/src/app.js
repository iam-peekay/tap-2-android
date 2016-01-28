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

socket.on('connect', () => {
  console.log('connection on client');
});

let image = document.getElementById('emulator-window').childNodes[0].nextSibling;
let replaced = false;

socket.on('raw', function (frameData) {
  if (!frameData) {
    return;
  }

  let canvas = document.createElement('canvas');
  if (!replaced) {
    canvas.width = emuWidth;
    canvas.height = emuHeight;
    let divImage = document.getElementById('emulator-window');
    divImage.appendChild(canvas);
    replaced = true;
  }

  let img = document.createElement('img');
  // let imageUrl = bufferToImage(frameData.data);
  // img.src = imageUrl;
  let ctx = canvas.getContext('2d');
  img.src = frameData.image;
  console.log(img);
  ctx.drawImage(img, frameData.x, frameData.y);
  // putImageData(ctx, frameData.x, frameData.y, frameData.width, frameData.height, frameData.data);
});


const putImageData = (ctx, dx, dy, width, height, imageData, dirtyX, dirtyY, dirtyWidth, dirtyHeight) => {
  dirtyX = dirtyX || 0;
  dirtyY = dirtyY || 0;
  dirtyWidth = dirtyWidth !== undefined ? dirtyWidth : width;
  dirtyHeight = dirtyHeight !== undefined ? dirtyHeight : height;
  var limitBottom = dirtyY + dirtyHeight;
  var limitRight = dirtyX + dirtyWidth;
  for (var y = dirtyY; y < limitBottom; y++) {
    for (var x = dirtyX; x < limitRight; x++) {
      var pos = y * width + x;
      ctx.fillStyle = 'rgba(' + imageData[pos * 4 + 0]
                        + ',' + imageData[pos * 4 + 1]
                        + ',' + imageData[pos * 4 + 2]
                        + ',' + (imageData[pos * 4 + 3]/255) + ')';
      console.log(ctx.fillStyle);
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
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
