/* global URL */

const Blob = require('blob');
const PNG = require('node-png').PNG;
const Canvas = require('canvas');

export const blobToImage = (imageData) => {
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

export const drawImage = (canvas, frameData) => {
  let img = new Image();

  img.onload = function() {
    console.log('got here');
    ctx = canvas.getContext('2d');
    ctx.drawImage(img, frameData.x, frameData.y);
  };

  let imageUrl = bufferToImage(frameData.data);
  img.src = frameData.image;

  if (typeof URL !== 'undefined') {
    URL.revokeObjectURL(src);
  }

  img.onerror = function(error) {
    console.log("ERROR: ", error);
  }
}

export const bufferToImage = (arrayBuffer) => {
    // Obtain a blob: URL for the image data.
    var arrayBufferView = new Uint8Array(arrayBuffer);
    var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
};

export const putImage = (dx, dy, width, height, imageData, dirtyX, dirtyY, dirtyWidth, dirtyHeight) => {
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');
  dirtyX = dirtyX || 0;
  dirtyY = dirtyY || 0;
  dirtyWidth = dirtyWidth !== undefined ? dirtyWidth : width;
  dirtyHeight = dirtyHeight !== undefined ? dirtyHeight : height;
  var limitBottom = dirtyY + dirtyHeight;
  var limitRight = dirtyX + dirtyWidth;
  for (var y = dirtyY; y < limitBottom; y++) {
    for (var x = dirtyX; x < limitRight; x++) {
      var pos = y * width + x;
      ctx.fillStyle = 'rgb(' + imageData[pos * 4 + 0]
                        + ',' + imageData[pos * 4 + 1]
                        + ',' + imageData[pos * 4 + 2] + ')';
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
}


export const encodeFrame = (rect) => {
  var rgb = new Buffer(rect.width * rect.height * 3, 'binary');
  var offset = 0;

  for (var i = 0; i < rect.data.length; i += 4) {
    rgb[offset] = rect.data[i + 2];
    offset += 1;
    rgb[offset] = rect.data[i + 1];
    offset += 1;
    rgb[offset] = rect.data[i];
    offset += 1;
  }
  var image = new PNG(rgb, rect.width, rect.height, 'rgb');
  return image;
}
