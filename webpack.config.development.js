'use strict';

module.exports = {
  output: {
    library: 'Routility',
    libraryTarget: 'umd'
  },

  devtool: 'source-map',

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      }
    ]
  }
};
