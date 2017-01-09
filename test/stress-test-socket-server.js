var config = require('../configFactory').getConfig();
var logger = require('../logging/logger').getLogger('stress_socket_' + config.env);
var socketConfig = config.socketConfig.serverAddress + ':' + config.socketConfig.serverPort;
var socket = require('socket.io-client')(socketConfig);
var signup = require('../backand_to_object').signup;
var spawn = require('child_process').spawn;
var async = require('async');


var signUpToken = 'a8362e8c-b4e4-4cf4-b217-3d6ffac2346c';
var anonymousToken = '337f502c-1ef8-48fd-bb98-e45f47472469';
var appName = 'stress';
var numWorkers = 200;


// generate multiple workers
async.times(numWorkers, function(n, next) {

	// register user
	// var d = Date.now();
	// Generate a v4 UUID (random) 
	const uuidV4 = require('uuid/v4');
	var d = uuidV4(); // -> '110ec58a-a0f2-4ac4-8393-c866d813b8d1' 
	var username = 'e' + d.replace('-','_') + '@aol.com';
	var password = 'secret';
    signup(signUpToken, username, password, password, 'f' + d, 'l' + d, function(err, user) {
    	if (!err){
    		// generate a worker for each user
	    	var child = spawn('node', ['./test/stress-worker.js', username, password]); 

	    	child.stdout.on('data', (data) => {
			  console.log(`stdout: ${data}`);
			});

			child.stderr.on('data', (data) => {
			  console.log(`stderr: ${data}`);
			});

			child.on('close', (code) => {
			  console.log(`child process exited with code ${code}`);
			  next(code);
			}); 
    	}
    	else{
    		console.log('error in signup:' + JSON.stringify(err));
    	}
    	

    });
}, function(err, users) {
    // we should now have 5 users
});







