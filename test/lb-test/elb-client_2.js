// var socket = require('socket.io-client')('http://54.209.197.67:4001');
var socket = require('socket.io-client')('http://yariv-495407567.us-east-1.elb.amazonaws.com');
 
socket.on('connect', function(){
    console.log('connected second');
    var r = Math.random();
	socket.emit('clientMessage', 'second ' + r);
});

socket.on('disconnect', function(){
    console.log('disconnect');
});

socket.on('reconnecting', function(){
    console.log('reconnecting');
});

socket.on('reconnect', function(){
    console.log('reconnect');
    var r = Math.random();
	socket.emit('clientMessage', 'second ' + r);
});

socket.on('error', function(error){
    console.log('error', error);
});

socket.on('serverMessage', function(data){
	console.log('serverMessage second', data);
});


