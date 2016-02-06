// Webpack imports
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config');

// Emulator import
const emulator = require('./emulator');

// HTTP server + Express server imports
const path = require('path');
const mustache = require('mustache-express');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

// Socket.io imports
const io = require('socket.io')(server);
const redis = require('socket.io-redis');
const port = process.env.PORT || 8000;
const uri = require('./redis').uri;
const compiler = webpack(config);
const redisMobile = require('./redis').mobile();

// Monkeyrunner
const child = require('child_process');
const monkeyRunnerPath = path.join(__dirname, '../../Library/Android/sdk/tools');
const scriptPath = path.join(__dirname, 'monkeyRunnerModule.py');
const monkeyRunnerChildProcessOptions = {
  cwd: monkeyRunnerPath,
  stdio: 'pipe'
}
const monkeyRunnerChildProcess = child.spawn('monkeyrunner', ['monkeyRunnerModule.py'] ,monkeyRunnerChildProcessOptions);

const newProcess = child.spawn('python', ['shell.py'], {cwd: '/Users/peekay/Desktop/tap-to-android/'});

const newProcess2 = child.spawn('python', ['monkeyRunnerTwo.py'], {cwd: '/Users/peekay/Desktop/tap-to-android/'});

newProcess.stdin.write('sdhfjshdf');
newProcess.stdin.end();
newProcess.stdout.on('data', function(data){
    console.log('new process 1, data', data);
});

var chunk = '';

newProcess2.stdout.on('data', function(data){
    console.log('new process 2, data');
    chunk += data;
});
newProcess2.stdout.on('close', function( ){
    console.log(chunk);
});

// Checking for failed exec of monkeyrunner child process
monkeyRunnerChildProcess.on('error', (err) => {
  console.log('Failed to start monkeyrunner child process.');
});

monkeyRunnerChildProcess.stdout.on('data', (data) => {
  console.log(data, 'data!');
});
monkeyRunnerChildProcess.stderr.on('data', (data) => {
  console.log(data, 'error with child process :(');
});

// "Adapter" = Interface in charge of routing messages.
// Here we use the one provided by socket.io on top of Redis
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
app.engine('mustache', mustache());
app.set('views', __dirname + '/views');

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

// Load Android emulator
setTimeout(function() {
  emulator();
}, 8000);

// Socket-io connection and event handlers
io.on('connection', (socket) => {

  console.log('socketio server connection successful!');

  socket.on('userInput', () => {
    console.log('got here!')

    monkeyRunnerChildProcess.stdin.write('hello');
    monkeyRunnerChildProcess.stdin.end();
  });

  socket.on('error', (error) => {
    console.log("error with socketio", error.stack)
  });

  socket.on('disconnect', () => {
    console.log('socketio server disconnected');
  });
});
