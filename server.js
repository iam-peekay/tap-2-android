const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config');
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
const compiler = webpack(config);
const redisMobile = require('./redis').mobile();

io.adapter(redis(uri));

server.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎  Listening on port %s.', port);
  }
});

app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));
app.use(express.static(path.join(__dirname, '/public')));

app.get('/dist', (req, res) => {
  console.log('got here');
  res.sendFile(path.join(__dirname, 'dist/bundle.js'));
});

app.get('/', (req, res, next) => {
  redisMobile.get('Android:frame', (err, image) => {
    if (err) {
      return next(err);
    } else {
      console.log(image, 'image');
    }
  });
  res.sendFile(path.join(__dirname, 'client/index.html'));
});



process.title = 'socket.io-android-emulator';

// Load Android emulator
emulator();

io.on('connection', (socket) => {
  console.log('socketio server connection');
  socket.on('disconnect', () => {
    console.log('socketio server disconnect');
  });
});
