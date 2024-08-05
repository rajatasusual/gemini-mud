const path = require('path');

module.exports = {
  mode: 'development', // or 'production'
  entry: './index.js', // Adjust to your entry file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map', // Add this line for source maps
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer"),
      "crypto": require.resolve("crypto-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "stream": require.resolve("stream-browserify"),
      "vm": require.resolve("vm-browserify"),
      "child_process": false, // Disable if not needed
      "fs": false, // Disable if not needed
      "path": false,
      "process": false, // Disable if not needed
    }
  },
  externals: {
    '@google/generative-ai': 'GoogleGenerativeAI', // Use the same global name as your script tag
    'ajv': 'Ajv'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            "sourceMaps": "inline" // Inline source maps for easier debugging
          }
        }
      }
    ]
  }
};