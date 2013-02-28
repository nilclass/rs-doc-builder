
var branch = process.argv[2] || 'master';

require('./docBuilder').build(branch, branch, function() { console.log('build done for', branch); });