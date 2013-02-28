
var PORT = 22478;

// ALLOWED:
// 207.97.227.253/32, 50.57.128.197/32, 108.171.174.178/32, 50.57.231.61/32, 54.235.183.49/32, 54.235.183.23/32, 54.235.118.251/32, 54.235.120.57/32, 54.235.120.61/32, 54.235.120.62/32.

var http = require('http');
var qs = require('querystring');

var docBuilder = require('./docBuilder');

http.createServer(function(request, response) {
    if(request.method !== 'POST') {
	response.writeHead(405);
	response.end();
    }
    var body = '';
    request.on('data', function(chunk) {
	body += chunk;
    });
    request.on('end', function() {
	var postData = qs.parse(body);
	var jsonData = JSON.parse(postData.payload);

	var refMatch = jsonData.ref.match(/^refs\/heads\/(.+)$/);
	if(refMatch) {
	    var branch = refMatch[1];
	    console.log('UPDATE', branch, jsonData.before, '->', jsonData.after);
	    docBuilder.build(branch, jsonData.head_commit.id, function() {
		console.log('DOC BUILD DONE', branch, jsonData.before, '->', jsonData.after);
	    });
	}
  	response.writeHead(200);
	response.end();
    });
}).listen(PORT);
