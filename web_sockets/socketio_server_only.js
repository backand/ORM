var httpd = require('http').createServer(handler);
var io = require('socket.io').listen(httpd);
var fs = require('fs');
var _ = require('underscore');

var redisPort = 6379;
var redisHostname = 'localhost';

var redis = require('redis'),
    RedisStore = require('socket.io-redis'),
    pub    = redis.createClient(redisPort, redisHostname),
    sub    = redis.createClient(redisPort, redisHostname),
    client = redis.createClient(redisPort, redisHostname);


io.adapter(new RedisStore({
  redisPub : pub,
  redisSub : sub,
  redisClient : client
}));

var redisInterface = redis.createClient(redisPort, redisHostname);


// socket server

httpd.listen(4000);

function handler(req, res) {

  console.log(req.url);
  
  fs.readFile(__dirname + req.url,
    function(err, data) {
      if (err) {
       res.writeHead(500);
       return res.end('Error loading index.html');
      }

      res.writeHead(200);
      res.end(data);
    }
  );
  
}

function authorize(token){
  // mockup
  if (!_.contains(["a", "b"], token))
    return false;
  else
    return token; //appName
}

io.sockets.on('connection', function (socket) {
  console.log("received connection");
  
  socket.on('clientMessage', function(data) {
    console.log("clientMessage", data);
    socket.emit('serverMessage',  'You said: ' + data.content);
    socket.broadcast.emit('serverMessage', { sender: socket.id, content: data.content });
  });

  socket.on('login', function(token) {
    console.log("login", token);
    var appName = authorize(token);
    if (authorize){ // enter into room for 
      socket.join(appName);
      socket.room = appName;
      socket.emit("authorized");
    }
    else{
      socket.emit("notAuthorized");
    }
    // socket.username = username;
    // redisInterface.set("username-" + username, socket.id);
  });

  socket.on('action', function(data) {
    var appName = data.appName;
    var action = data.action;
    console.log("action", data);
    io.to(appName).emit(action, data.content);
    // redisInterface.get("username-" + data.username, function(err, reply) {
    //   if (!err && reply){
    //     var socketId = reply;
    //     io.to(socketId).emit('action', { content: data.content }); 
    //   }
    // });
    // socket.broadcast.emit('action', { content: data });
  });

});

