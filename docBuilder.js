
var GIT_COMMAND = "git";
var SHARED_REPO = process.cwd() + '/shared-repo';
var HEADS_ROOT = process.cwd() + '/heads';
var WEB_ROOT = process.cwd() + '/web/remotestorage';
var WEB_HEADS_ROOT = WEB_ROOT + '/heads';
var HEAD_INDEX_PATH = WEB_ROOT + '/heads.json';

var fs = require('fs');
var ChildProcess = require('child_process');

function createDir(path, done) {
    fs.stat(path, function(err, result) {
	if(! err) {
	    done();
	} else {
	    fs.mkdir(path, done);
	}
    });
}

function runGit(workTree, args, done) {

    var gitArgs = ['--git-dir=' + SHARED_REPO];
    if(workTree) {
	gitArgs.push('--work-tree=' + workTree);
    }

    var git = ChildProcess.spawn(GIT_COMMAND, gitArgs.concat(args));

    var output = '';

    git.stdout.on('data', function(chunk) {
	output += chunk;
    });

    git.stderr.on('data', function(chunk) {
	output += chunk;
    });

    git.on('exit', function(result) {
	console.log('git ' + args[0] + ' done, ', result);
	if(result === 0) {
	    done();
	} else {
	    console.log('result code not 0, dumping output');
	    console.log(output);
	}
    });
}

function updateShared(done) {
    runGit(null, ['fetch'], done);
}

function updateBranch(branch, commitId, done) {

    var headPath = HEADS_ROOT + '/' + branch;

    createDir(headPath, function() {
	runGit(headPath, ['reset', '--hard'], function() {
	    runGit(headPath, ['checkout', commitId], function() {
		runGit(headPath, ['reset', '--hard', commitId], function() {
		    console.log('updateBranch done');
		    done();
		});
	    });
	});
    });
}

function buildDocs(branch, done) {
    var headPath = HEADS_ROOT + '/' + branch;

    var make = ChildProcess.spawn(
	"make", ['doc'],
	{ cwd: headPath }
    );

    var output = '';

    make.stdout.on('data', function(chunk) {
	output += chunk;
    });

    make.stderr.on('data', function(chunk) {
	output += chunk;
    });

    make.on('exit', function(result) {
	console.log('buildDocs done, ', result);
	if(result === 0) {
	    done();
	} else {
	    console.log('result code not 0, dumping output');
	    console.log(output);
	}
    });    
}

function publishDocs(branch, done) {
    var headPath = HEADS_ROOT + '/' + branch;
    var webPath = WEB_HEADS_ROOT + '/' + branch;

    var copy = ChildProcess.spawn(
	"cp", ['-u', '-r',
	       headPath + '/doc/code',
	       webPath]
    );

    var output = '';

    copy.stdout.on('data', function(chunk) {
	output += chunk;
    });

    copy.stderr.on('data', function(chunk) {
	output += chunk;
    });

    copy.on('exit', function(result) {
	console.log('publishDocs done, ', result);
	if(result === 0) {
	    done();
	} else {
	    console.log('result code not 0, dumping output');
	    console.log(output);
	}
    });    
}

function updateIndex(branch, done) {
    fs.readFile(HEAD_INDEX_PATH, 'utf-8', function(err, data) {
	console.log('read index', data);
	var index;
	try {
	    index = JSON.parse(data);
	} catch(exc) {
	    index = [];
	}
	var il = index.length;
	for(var i=0;i<il;i++) {
	    if(index[i] === branch) {
		return done();
	    }
	}
	index.push(branch);
	fs.writeFile(HEAD_INDEX_PATH, JSON.stringify(index), done);
    });
}

exports.build = function(branch, commitId, done) {

    updateShared(function() {
	updateBranch(branch, commitId, function() {
	    buildDocs(branch, function() {
		publishDocs(branch, function() {
		    updateIndex(branch, function() {
			console.log('updateIndex done');
			done();
		    });
		});
	    });
	});
    });

};
