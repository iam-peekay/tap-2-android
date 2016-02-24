/* global URL */

const io = require('socket.io-client');
// NOTE: Must be set to the external IP address of
// the machine the server runs on
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || '8000';
const socket = io.connect(`http://${host}:${port}`);

// Define canvas element where Android emulator will be painted
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

/*
  Function that converts image buffer data to appropriate format
*/
const putImageOnCanvas = (imageData) => {
  // Convert raw Array buffer to a data view, 0 byte offset
  let dataView = new DataView(imageData.data, 0);
  // Generate image data for canvas using width and height
  const canvasImageData = ctx.createImageData(imageData.width, imageData.height);
  let red;
  let green;
  let blue;
  /*
    We need to overwrite the canvasImageData.data value
    because it is expecting it to be 32bpp, but our
    data is 16bpp.

    For every 2 bytes (16 bits), we generate the current pixel
    containing 16 bits, little endian true. This is how our data
    is coming in. Then we apply the red/blue/green shift, then &
    the result by the red/green/blue max. (see section 7.4 to of
    the rfb protocol: https://tools.ietf.org/rfc/rfc6143.txt.)
    What we're left with now is the color value out of the max
    possible value (e.g. 12 out of 31 for red or 50 out of 63 for
    green and so on). So we need to divide this result by the
    max value to get a %, and then multiply by 255 because
    putImageData is expecting canvasImageData.data values to be
    represented between 0 and 255.

    We go through each pixel like this, and assign the converted
    color values to the canvasImageData object. So the first
    index is Red, second is blue, third is green and so on.
    Note that we are not receiving alpha values in our raw
    pixel data. Out of the 16 bits, 5 are for red, 6 for green
    and 5 for blue. None for alpha. But the canvasImageData is
    expecting an alpha value at every 4th index, so we just set it
     to 255 for every pixel.
  */
  for (let i = 0; i < dataView.byteLength; i += 2) {
    let currentPixel = dataView.getInt16(i, true);
    red = (((currentPixel >> 11) & 31) / 31) * 255;
    green = (((currentPixel >> 5) & 63) / 63) * 255;
    blue = ((currentPixel & 31) / 31) * 255;

    canvasImageData.data[i * 2 + 0] = red; // R
    canvasImageData.data[i * 2 + 1] = green; // G
    canvasImageData.data[i * 2 + 2] = blue; // B
    canvasImageData.data[i * 2 + 3] = 255; // A
  }

  ctx.putImageData(canvasImageData, imageData.x, imageData.y);
};

/*
  Socket.io client connection.

  We listen to rect events coming from our emulator's
  VNC server, then convert the raw buffer data for each
  rect to RGBA format, and then paint each rect to canvas.
*/

socket.on('connect', () => {
  console.log('connection on client');
});


socket.on('firstFrame', (imageData) => {
  console.log('first frame');
  if (!imageData) {
    return;
  }

  // Set up canvas properties & context
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  // Paint imageData to canvas
  putImageOnCanvas(imageData);
});

socket.on('raw', (imageData) => {
  if (!imageData) {
    return;
  }
  // Paint imageData to canvas
  putImageOnCanvas(imageData);
});

socket.on('copy', (rect) => {
  const canvasImageData = ctx.getImageData(rect.src.x, rect.src.y, rect.width, rect.height);
  // Paint imageData to canvas
  putImageOnCanvas(canvasImageData);
});


// Define touch and click events on canvas
let touchStart = [];
let touchEnd = [];
let touchMove = [];
let mouseUp = [];
let mouseDown = [];

function handleTouchStart(ev) {
  ev.preventDefault();
  let touches = ev.changedTouches;
  console.log('touch start', touches);

  touchStart.unshift(touches);
}

function handleTouchEnd(ev) {
  ev.preventDefault();
  let touches = ev.changedTouches;
  console.log('touch end', touches);

  touchEnd.unshift(touches);
  if (touchStart.length === 0) {
    return;
  }

  if (touchMove.length === 0) {
    socket.emit('touch', {
      'x': touches[0].clientX,
      'y': touches[0].clientY
    });
    touchMove = [];
  } else {
    socket.emit('drag', {
      'startX': touchStart[0][0].clientX,
      'startY': touchStart[0][0].clientY,
      'endX': touches[0].clientX,
      'endY': touches[0].clientY
    });
    touchMove = [];
  }
}

function handleTouchMove(ev) {
  ev.preventDefault();
  let touches = ev.changedTouches;

  touchMove.push(touches);
}

function handleTouchCancel(ev) {
  ev.preventDefault();
  let touches = ev.changedTouches;
  console.log(touches);
}

function handleMouseDown(ev) {
  ev.preventDefault();
  mouseDown.unshift(ev);
}

function handleMouseUp(ev) {
  ev.preventDefault();
  mouseUp.unshift(ev);
  if (mouseDown[0].pageX === mouseUp[0].pageX && mouseDown[0].pageY === mouseUp[0].pageY) {
    socket.emit('touch', {
      'x': mouseUp[0].pageX,
      'y': mouseUp[0].pageY,
    });
  } else {
    socket.emit('drag', {
      'startX': mouseDown[0].pageX,
      'startY': mouseDown[0].pageY,
      'endX': mouseUp[0].pageX,
      'endY': mouseUp[0].pageY,
    });
  }
}

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchend', handleTouchEnd, false);
canvas.addEventListener('touchcancel', handleTouchCancel, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('mouseup', handleMouseUp, false);
canvas.addEventListener('mousedown', handleMouseDown, false);
