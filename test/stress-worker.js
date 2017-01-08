var config = require('../configFactory').getConfig();
var logger = require('../logging/logger').getLogger('stress_socket_' + config.env);
var socketConfig = config.socketConfig.serverAddress + ':' + config.socketConfig.serverPort;
var socket = require('socket.io-client')(socketConfig);
var signin = require('../backand_to_object').signin;

var signUpToken = 'a8362e8c-b4e4-4cf4-b217-3d6ffac2346c';
var anonymousToken = '337f502c-1ef8-48fd-bb98-e45f47472469';
var appName = 'stress';

var username = process.argv[2];
var password = process.argv[3];


socket.on('connect', function(){
    logger.debug('connected');
    // login user

	signin(appName, username, password, function(err, data){
		logger.debug('signin', err, data, (typeof data));
		if (err){
			logger.debug('cannot signin:' + JSON.stringify(err));
		}
		else{
			var d = JSON.parse(data);
			var token = d.access_token;
			console.log(token);
			socket.emit('login', token, null, appName);
		}


	});
    
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
	logger.debug('items_updated', data);
});


