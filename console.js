var repl = require('repl');
var chokidar = require('chokidar');
var path = require('path');

var ctx = repl.start({
  input: process.stdin,
  output: process.stdout
}).context;

var bundleFile = path.resolve('./dist/infinitechain_nodejs');

var IFCBuilder = require('./dist/infinitechain_nodejs');
ctx.IFCBuilder = IFCBuilder;

chokidar.watch('./dist/infinitechain_nodejs', {ignored: /[\/\\]\./}).on('change', function(event, path) {
  delete require.cache[bundleFile];
  var IFCBuilder = require('./dist/infinitechain_nodejs');
  ctx.IFCBuilder = IFCBuilder;
});
