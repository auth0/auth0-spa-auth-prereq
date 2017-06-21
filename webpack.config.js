const env = process.env.WEBPACK_ENV;
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: "./index.js",
  externals: [nodeExternals()],
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  output: {
    filename: `./dist/auth-prereq${env === 'dist' ? '.min' : ''}.js`
  },
  target: 'node'
}