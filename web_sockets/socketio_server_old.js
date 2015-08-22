var httpd = require('http').createServer(handler);
var io = require('socket.io').listen(httpd);
var fs = require('fs');

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

io.sockets.on('connection', function (socket) {
  console.log("received connection");
  
  socket.on('clientMessage', function(data) {
    console.log("clientMessage", data);
    socket.emit('serverMessage',  'You said: ' + data.content);
    socket.broadcast.emit('serverMessage', { sender: socket.id, content: data.content });
  });

  socket.on('login', function(username) {
    console.log("login", username);
    socket.username = username;
    redisInterface.set("username-" + username, socket.id);
  });

  socket.on('action', function(data) {
    console.log("action", data);
    redisInterface.get("username-" + data.username, function(err, reply) {
      if (!err && reply){
        var socketId = reply;
        io.to(socketId).emit('action', { content: data.content }); 
      }
    });
    // socket.broadcast.emit('action', { content: data });
  });

});

