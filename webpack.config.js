const env = process.env.WEBPACK_ENV;

module.exports = {
  entry: "./index.js",
  output: {
    filename: `./dist/auth-prereq${env === 'dist' ? '.min' : ''}.js`
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
}