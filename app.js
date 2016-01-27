const express = require('express');
const app = express();
const path = require('path');
const emulator = require('./emulator');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const redis = require('socket.io-redis');
const port = process.env.PORT || 8000;
const uri = require('./redis').uri;

io.adapter(redis(uri));

server.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎  Listening on port %s.', port);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.use(express.static(path.join(__dirname, '/public')));

process.title = 'socket.io-android-emulator';

// Load Android emulator
emulator();

io.on('connection', (socket) => {
  console.log('socketio server connection');
  socket.on('disconnect', () => {
    console.log('socketio server disconnect');
  });
});
