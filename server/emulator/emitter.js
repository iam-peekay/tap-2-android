const Android = require('./android');
const redis = require('./../redis').emulator();
const io = require('socket.io-emitter')(redis);

process.title = 'socket.io-android-emulator';

// Load Android emulator instance and listen to events
// being emitted from Android emulator
function loadEmulator() {
  const emulator = new Android();

  emulator.on('error', () => {
    console.log('Destroying emulator');    
    emulator.destroy();
    console.log('Restarting emulator');
    setTimeout(loadEmulator, 1000);
  });

  emulator.on('connect', () => {
    io.emit('success');
  })

  emulator.on('raw', (imageData) => {
    io.emit('raw', imageData);
  });

  emulator.on('firstFrame', (imageData) => {
    io.emit('firstFrame', imageData);
  });

  emulator.on('copy', (rect) => {
    io.emit('copy', rect);
  });

  // Run the emulator after a delay of 1 second
  setTimeout(() => {
    console.log('Booting up Android emulator');
    emulator.run();
  }, 1000);
}

module.exports = loadEmulator;
