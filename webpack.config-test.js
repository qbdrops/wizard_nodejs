const path = require('path');
const Webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

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
  devtool: 'cheap-module-eval-source-map',
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve('src'),
      '@@': path.resolve('.'),
      '#': path.resolve('test')
    }
  },
  target: 'node',
  externals: [nodeExternals()],
  plugins: [
    // ingnore electron that used in got package
    new Webpack.IgnorePlugin(/^electron$/)
  ]
};
