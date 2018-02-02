var repl = require('repl');
var chokidar = require('chokidar');
var path = require('path');

var ctx = repl.start({
  input: process.stdin,
  output: process.stdout
}).context;

var bundleFile = path.resolve('./dist/infinitechain_sdk.js');

var IFCBuilder = require('./dist/infinitechain_sdk.js');
ctx.IFCBuilder = IFCBuilder;

chokidar.watch('./dist/infinitechain_sdk.js', {ignored: /[\/\\]\./}).on('change', function(event, path) {
  delete require.cache[bundleFile];
  var IFCBuilder = require('./dist/infinitechain_sdk.js');
  ctx.IFCBuilder = IFCBuilder;
});
