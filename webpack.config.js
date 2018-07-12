var path = require('path');

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
        presets: ['es2015', 'es2016', 'es2017'],
        plugins: ['babel-plugin-transform-runtime', 'babel-plugin-transform-class-properties']
      }
    },
    {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve('src'),
      '@@': path.resolve('.'),
      '#': path.resolve('test')
    }
  },
  target: 'node'
};
