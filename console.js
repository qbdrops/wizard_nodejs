var repl = require('repl');
var chokidar = require('chokidar');
var path = require('path');

var ctx = repl.start({
  input: process.stdin,
  output: process.stdout
}).context;

var bundleFile = path.resolve('./dist/wizard_nodejs');

var wizard = require('./dist/wizard_nodejs');
ctx.wizard = wizard;

chokidar.watch('./dist/wizard_nodejs', { ignored: /[/\\]\./ }).on('change', function () {
  delete require.cache[bundleFile];
  var wizard = require('./dist/wizard_nodejs');
  ctx.wizard = wizard;
});
