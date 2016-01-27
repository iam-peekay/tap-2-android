var io = require('socket.io-client')(config.io);
var keymap = require('./keymap');
var blobToImage = require('./blob');
var Queue = require('queue3');
