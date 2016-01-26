const express = require('express');
const app = express();
const path = require('path');
const io = require('socket.io')();
const fs = require('fs');
const Android = require('./android');

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.listen(port, (error) => {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s.", port)
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

process.title = 'socket.io-android-emulator';

// load computer emulator
(function load() {
  var emu = new Android();

  emu.on('error', () => {
    console.log(new Date + ' - restarting emulator');
    emu.destroy();
    setTimeout(load, 1000);
  });

  emu.on('raw', (frame) => {
    io.emit('raw', frame);
  });

  emu.on('frame', (buf) => {
    redis.set('computer:frame', buf);
  });

  emu.on('copy', (rect) => {
    io.emit('copy', rect);
  });

  setTimeout(() => {
    console.log('running emu');
    emu.run();
  }, 2000);

})();





// var getUsersInRoom = function(roomName, namespace) {
//     if (!namespace) namespace = '/';
//     var room = io.nsps[namespace].adapter.rooms[roomName];
//     if (!room) return null;
//     return Object.keys(room);
// }
//
// io.on('connection', function(socket){
//   console.log('socket.io connection');
//
//   socket.on('disconnect', function(){
//     console.log('socket.io disconnect');
//     if (socket.room) {
//       var room = socket.room;
//       io.to(room).emit('leave', socket.id);
//       socket.leave(room);
//     }
//   });
//
//   socket.on('join', function(name, callback){
//     console.log('join', name);
//     var socketIds = getUsersInRoom(name);
//     callback(socketIds);
//     socket.join(name);
//     socket.room = name;
//   });
// });
