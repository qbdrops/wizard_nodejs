var repl = require('repl');
var chokidar = require('chokidar');
var path = require('path');

var ctx = repl.start({
  input: process.stdin,
  output: process.stdout
}).context;

var bundleFile = path.resolve('./dist/wizard_nodejs');

var IFCBuilder = require('./dist/wizard_nodejs');
ctx.IFCBuilder = IFCBuilder;

chokidar.watch('./dist/wizard_nodejs', {ignored: /[/\\]\./}).on('change', function () {
  delete require.cache[bundleFile];
  var IFCBuilder = require('./dist/wizard_nodejs');
  ctx.IFCBuilder = IFCBuilder;
});
