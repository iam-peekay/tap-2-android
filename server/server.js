// Webpack imports
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./../webpack.config');
const compiler = webpack(config);

// Emulator import
const emulatorEmitter = require('./emulator/emitter');

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

/*
  Connection to Android View Client.
  Create a ZeroRPC client object which connects to a
  listening RPC Python server and can invoke any of
  the functions in the class with which the server was
  created.

  NOTE: Python server was created on the same machine
  as the node server, and we are connected to it at
  localhost (127.0.0.1).

  (See androidViewClient.py in the emulator directory)
*/

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
app.set('views', __dirname + '/../client/views');

// Routes
app.get('/dist', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/bundle.js'));
});
app.get('/', (req, res) => {
    res.render('index.mustache');
});

// Load Android emulator (TEMPORARY)
setTimeout(function() {
  emulatorEmitter();
}, 8000);

/*
  Socket-io connection and event handlers. The main
  event here is 'userInput' events being emitted from
  socket.io client every time a user interacts with
  the emulator. On each userInput event, we invoke an
  RPC call to our python program (which is an RPC server).
  The RPC server invokes any of the functions in the class
  with which the server was created.
  
  (i.e. the first argument passed to "client.invoke" is
  the name of the function, and remaining args are arguments
  being passed to this function)
*/
io.on('connection', (socket) => {
  console.log('socketio server connection successful!');

  socket.on('userInput', () => {
    console.log('got here!')
    client.invoke('handle_user_input', 'menu', {'something': 1}, function(error, res, more) {
      if (error) {
        console.log(error.stack);
      } else {
        console.log(res);
      }
    });
  });

  socket.on('error', (error) => {
    console.log("error with socketio", error.stack)
  });

  socket.on('disconnect', () => {
    console.log('socketio server disconnected');
  });
});
