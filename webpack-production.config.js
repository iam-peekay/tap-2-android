var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './client/src/app',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  })
  ],
  module: {
    preLoaders: [
      { test: /\.js$/, loaders: ['eslint-loader'], exclude: /node_modules/ }
    ],
    loaders: [
      { test: /\.js$/, loaders: [ 'babel'], exclude: /node_modules/ },
      { test: /\.jsx$/, loaders: [ 'babel'], exclude: /node_modules/ },
      { test: /\.(jpe?g|png|gif|svg)$/i, loader: 'url?limit=10000!img?progressive=true' },
      { include: /\.json$/, loaders: ['json-loader'] }
    ]
  },
  resolve: {
    extensions: ['', '.json', '.jsx', '.js']
  },
  eslint: {
    formatter: require("eslint-friendly-formatter"),
    configFile: './.eslintrc',
    failOnError: true
  }
}
