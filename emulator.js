var fs = require('fs');
var Android = require('./android');

process.title = 'socket.io-android-emulator';

// load computer emulator
var emu;

function load() {
  debug('loading emulator');
  emu = new Android();

  emu.on('error', function() {
    console.log(new Date + ' - restarting emulator');
    emu.destroy();
    setTimeout(load, 1000);
  });

  emu.on('raw', function(frame) {
    io.emit('raw', frame);
  });

  emu.on('frame', function(buf) {
    redis.set('computer:frame', buf);
  });

  emu.on('copy', function(rect) {
    io.emit('copy', rect);
  });

  setTimeout(function() {
    console.log('running android emulator');
    emu.run();
  }, 2000);

}

load();
