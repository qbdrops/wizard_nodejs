var repl = require('repl');
var chokidar = require('chokidar');
var path = require('path');

var ctx = repl.start({
  input: process.stdin,
  output: process.stdout
}).context;

var bundleFile = path.resolve('./bundle.js');

var IFCBuilder = require('./bundle.js');
ctx.IFCBuilder = IFCBuilder;

chokidar.watch('./bundle.js', {ignored: /[\/\\]\./}).on('change', function(event, path) {
  delete require.cache[bundleFile];
  var IFCBuilder = require('./bundle.js');
  ctx.IFCBuilder = IFCBuilder;
});
