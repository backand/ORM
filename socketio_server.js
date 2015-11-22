
var fs = require('fs');
var socketBl  = require('./web_sockets/redis_bl')

var options = {
    pfx: fs.readFileSync('/Users/backand/Desktop/api.backand.com.elb2.pfx'),
    passphrase: '123456'
};

var httpd = require('https').createServer(options, handler);
var io = require('socket.io').listen(httpd);
var _ = require('underscore');
var getUserDetails = require('./backand_to_object').getUserDetails;

var redisConfig = require('./config').redis;

var redisPort = redisConfig.port;
var redisHostname = redisConfig.hostname;
var option = redisConfig.option;

var redis = require('redis'),
    RedisStore = require('socket.io-redis'),
    pub = redis.createClient(redisPort, redisHostname, option),
    sub = redis.createClient(redisPort, redisHostname, option),
    client = redis.createClient(redisPort, redisHostname, option);
var redisInterface = redis.createClient(redisPort, redisHostname, option);

redisInterface.on('connect', function () {
    runSocket();
});

httpd.listen(4000);

function handler(req, res) {

    console.log(req.url);

    fs.readFile(__dirname + req.url,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        }
    );

}

function runSocket() {

    var redisBl = new socketBl.BusinessLogic(redisInterface);

    io.adapter(new RedisStore({
        pubClient: pub,
        subClient: sub,
        redisClient: client
    }));


// socket server

    function userIsInRoom(appName, id) {
        return io.sockets.adapter.rooms[appName][id];
    }


    io.sockets.on('connection', function (socket) {
        function sendMultiple(socket, users, event, message) {
            if (users === null || users.length == 0) {
                return;
            }

            _.each(users, function (u) {
                io.to(u.socketId).emit(event, message);
            })
        }

        console.log("received connection");

        socket.on('login', function (token, anonymousToken, appName) {
            getUserDetails(token, anonymousToken, appName, function (err, details) {
                if (!err) {
                    redisBl.login(socket, appName, details.username, details.role);
                }
                else {
                    socket.emit("notAuthorized");
                }
            })
        });

        socket.on('disconnect', function () {
            var id = socket.id;

            redisBl.removeSocket(id);

        })

        socket.on('internalAll', function (internal) {
            console.log('here');
            var appName = internal.appName;
            var eventName = internal.eventName;
            io.to(appName).emit(eventName, internal.data);
            console.log(eventName, internal.data);
        });

        socket.on('internalRole', function (internal) {
            var appName = internal.appName;
            var eventName = internal.eventName;
            var role = internal.role;
            var data = internal.data;

            if (!appName || !eventName || !role || !eventName) {
                return;
            }

            redisBl.getAllUsersByRole(appName, role, function (err, users) {
                sendMultiple(appName, users, eventName, data);
            });
        });

        socket.on('internalUsers', function (internal) {
            var appName = internal.appName;
            var eventName = internal.eventName;
            var users = internal.users;
            var data = internal.data;

            if (!appName || !eventName || !users || !eventName) {
                return;
            }

            redisBl.getUserByList(appName, users, function (err, users) {
                sendMultiple(appName, users, eventName, data);
            });
        });


    });

}

