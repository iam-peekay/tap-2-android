const Android = require('./android');
const redis = require('./../redis').emulator();
const io = require('socket.io-emitter')(redis);

process.title = 'socket.io-android-emulator';

// load computer emulator
function loadEmulator() {

  const emulator = new Android();

  emulator.on('error', () => {
    console.log('Restarting emulator');
    emulator.destroy();
    setTimeout(loadEmulator, 1000);
  });

  emulator.on('connect', () => {
    io.emit('success');
  })

  emulator.on('raw', (frame) => {
    io.emit('raw', frame);
  });

  emulator.on('frame', (buf) => {
    redis.set('Android:frame', buf);
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
