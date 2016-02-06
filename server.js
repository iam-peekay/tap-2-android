// Webpack imports
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config');
const compiler = webpack(config);

// Emulator import
const emulator = require('./emulator');

// HTTP server + Express server imports
const path = require('path');
const mustache = require('mustache-express');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

// Socket.io server
const io = require('socket.io')(server);
const redis = require('socket.io-redis');
const port = process.env.PORT || 8000;
const uri = require('./redis').uri;
const redisMobile = require('./redis').mobile();

// Connection to Android View Client
const zerorpc = require("zerorpc");
const client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");
const child = require('child_process');

// "Adapter" = Interface in charge of routing messages.
// Here we use the one provided by socket.io on top of Redis
io.adapter(redis(uri));

// Socket.io/Express server
server.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎  Listening on port %s.', port);
  }
});

// Middleware
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));

// Views
app.engine('mustache', mustache());
app.set('views', __dirname + '/views');

// Routes
app.get('/dist', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/bundle.js'));
});
app.get('/', (req, res, next) => {
  redisMobile.get('Android:frame', (err, image) => {
    if (err) {
      return next(err);
    } else {
      res.render('index.mustache', {
        img: image ? image : ''
      });
    }
  });
});

// Load Android emulator (TEMPORARY)
setTimeout(function() {
  emulator();
}, 8000);

// Socket-io connection and event handlers
io.on('connection', (socket) => {
  console.log('socketio server connection successful!');

  socket.on('userInput', () => {
    console.log('got here!')
    // monkeyRunnerChildProcess.stdin.write('hello');
    // monkeyRunnerChildProcess.stdin.end();
    client.invoke("handle_user_input", "hello", function(error, res, more) {
        console.log(res);
    });
  });

  socket.on('error', (error) => {
    console.log("error with socketio", error.stack)
  });

  socket.on('disconnect', () => {
    console.log('socketio server disconnected');
  });
});
