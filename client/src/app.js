const blobToImage = require('./blob');
const Queue = require('queue');
const queue = new Queue({ concurrency: 1 });
const io = require('socket.io-client');
const socket = io.connect('http://localhost:8000');
const natWidth = 800;
const natHeight = 600;

socket.on('connect', () => {
  console.log('connection on client');
});

const image = document.getElementById('canvas');

socket.on('raw', (frame) => {
  console.log(frame);
  queue.push((fn) => {
    let replaced = false;
    const src = blobToImage(frame.image);
    if (!src) return;

    const img = document.createElement('img');
    img.src = src;
    img.onload = () => {
      if (!replaced) {
        const canvas = document.createElement('canvas');
        canvas.width = natWidth;
        canvas.height = natHeight;
        image.replaceWith(canvas);
        replaced = true;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, frame.x, frame.y);
      }

      if (typeof URL !== 'undefined') {
        URL.revokeObjectURL(src);
      }

      fn();
    };
  });
});
