const path = require('path');
const Webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// if build with source map, got API fatal error handler returned after process out of memory
const isProduction = (process.env.NODE_ENV === 'production');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'dist/wizard_nodejs.js',
    library: '',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['env'],
        plugins: ['babel-plugin-transform-runtime', 'babel-plugin-transform-class-properties']
      }
    },
    {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  devtool: (isProduction) ? false : 'cheap-module-eval-source-map',
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve('src'),
      '@@': path.resolve('.'),
      '#': path.resolve('test')
    }
  },
  target: 'node',
  plugins: [
    // ingnore electron that used in got package
    new Webpack.IgnorePlugin(/^electron$/),
    // uglify js
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: (isProduction) ? false : true,
      parallel: true
    }),
  ]
};
