const redis = require('redis');
const uri = process.env.REDIS_URI || 'localhost:6379';
const pieces = uri.split(':');

const redisClient = () => {
  return redis.createClient(pieces[1], pieces[0], {return_buffers: true});
};

module.exports = {
  uri,
  emulator: redisClient
};
