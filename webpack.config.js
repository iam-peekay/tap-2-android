var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: './client/src/app',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: "/static/"
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.ProgressPlugin(function handler(percentage, msg) {
      if ((percentage * 100) % 20 === 0) {
        console.log(percentage * 100 + '%')
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
