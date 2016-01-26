const express = require('express');
const app = express();
const path = require('path');
const emulator = require('./emulator');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/public')));

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎  Listening on port %s.', port);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

process.title = 'socket.io-android-emulator';

// Load Android emulator
emulator();
