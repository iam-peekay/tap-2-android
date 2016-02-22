/* global URL */

const Blob = require('blob');
const PNG = require('node-png').PNG;

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
    let arrayBufferView = new Uint8Array(arrayBuffer);
    let blob = new Blob([arrayBufferView], { type: "image/jpeg" });
    let urlCreator = window.URL || window.webkitURL;
    let imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
};

export const putImage = (ctx, dx, dy, width, height, imageData, dirtyX, dirtyY, dirtyWidth, dirtyHeight) => {
  let data = imageData.data;
  let height = imageData.height;
  let width = imageData.width;
  dirtyX = dirtyX || 0;
  dirtyY = dirtyY || 0;
  dirtyWidth = dirtyWidth !== undefined? dirtyWidth: width;
  dirtyHeight = dirtyHeight !== undefined? dirtyHeight: height;
  let limitBottom = dirtyY + dirtyHeight;
  let limitRight = dirtyX + dirtyWidth;
  for (let y = dirtyY; y < limitBottom; y++) {
    for (let x = dirtyX; x < limitRight; x++) {
      let pos = y * width + x;
      ctx.fillStyle = 'rgba(' + data[pos*4+0]
                        + ',' + data[pos*4+1]
                        + ',' + data[pos*4+2]
                        + ',' + (data[pos*4+3]/255) + ')';
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
}

export const encodeFrame = (rect) => {
  let rgb = new Buffer(rect.width * rect.height * 3, 'binary');
  let offset = 0;

  for (let i = 0; i < rect.data.length; i += 4) {
    rgb[offset] = rect.data[i + 2];
    offset += 1;
    rgb[offset] = rect.data[i + 1];
    offset += 1;
    rgb[offset] = rect.data[i];
    offset += 1;
  }
  let image = new PNG(rgb, rect.width, rect.height, 'rgb');
  return image;
}

export const convertBase = (num) => {
    return {
        from: (baseFrom) => {
            return {
                to: (baseTo) => parseInt(num, baseFrom).toString(baseTo);
            }
        }
    }
}

// binary to hexadecimal
export const bin2hex (num) => convertBase(num).from(2).to(16);

// swap 16bit
export const swap16 (val) => ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
