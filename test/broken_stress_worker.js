var config = require('../configFactory').getConfig();
var logger = require('../logging/logger').getLogger('stress_socket_' + config.env);
var socketConfig = config.socketConfig.serverAddress + ':' + config.socketConfig.serverPort;
var socket = require('socket.io-client')(socketConfig);
var signin = require('../backand_to_object').signin;

var signUpToken = 'a8362e8c-b4e4-4cf4-b217-3d6ffac2346c';
var anonymousToken = '337f502c-1ef8-48fd-bb98-e45f47472469';
var appName = 'stress';

var username = process.argv.length > 2 ? process.argv[2] : null;
var password = process.argv.length > 2 ? process.argv[3]: null;

console.log('worker', username, password);


socket.on('connect', function(){
    logger.debug('connected');
    
    if (username){
	    // login user
		signin(appName, username, password, function(err, data){
			if (err){
				logger.debug('cannot signin:' + username + ' ' + password + ' ' + JSON.stringify(err));
			}
			else{
				logger.debug('signin', data);
				var d = JSON.parse(data);
				var token = d.access_token;
				// console.log(token);
				socket.emit('login', 'bearer ' + token, null, appName);
			}
		}); 
    }
    else{
    	socket.emit('login', null, anonymousToken, appName);
    }
});

socket.on('disconnect', function(){
    logger.debug('disconnect');
});

socket.on('reconnecting', function(){
    logger.debug('reconnecting');
});

socket.on('error', function(error){
    logger.debug('error', error);
});

socket.on('items_updated', function(data){
	logger.debug('items_updated', username, data);
});


