var httpd = require('http').createServer(handler);
var io = require('socket.io').listen(httpd);
var fs = require('fs');
var _ = require('underscore');
var getUserDetails = require('./backand_to_object').getUserDetails;


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

  socket.on('login', function(token, anonymousToken, appName) {
    console.log("login", token);

    getUserDetails(token, anonymousToken, appName,function(err, details){
      if(!err){
        socket.join(appName);
        socket.room = appName;
        socket.emit("authorized");
        console.log("authorized");
      }
      else{
        socket.emit("notAuthorized");
        console.log("notAuthorized");
      }
    })

  });

  socket.on('internal', function(internal) {
    var appName = internal.appName;
    var eventName = internal.eventName;
    console.log("action:", internal);

    io.to(appName).emit(eventName, internal.data);

  });

});

