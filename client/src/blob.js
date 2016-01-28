/* global URL */

/* dependencies */
const Blob = require('blob');

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

export default blobToImage;
