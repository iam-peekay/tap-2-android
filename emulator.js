const Android = require('./android');
const debug = require('debug');
const io = require('socket.io-emitter');

process.title = 'socket.io-android-emulator';

// load computer emulator
function loadEmulator() {
  debug('loading emulator');

  const emulator = new Android();

  emulator.on('error', () => {
    console.log('Restarting emulator');
    emulator.destroy();
    setTimeout(loadEmulator, 1000);
  });

  emulator.on('raw', (frame) => {
    io.emit('raw', frame);
  });

  emulator.on('frame', (buf) => {
    io.emit('frame', buf);
  });

  emulator.on('copy', (rect) => {
    io.emit('copy', rect);
  });

  setTimeout(() => {
    console.log('running android emulator');
    emulator.run();
  }, 2000);
}

module.exports = loadEmulator;
