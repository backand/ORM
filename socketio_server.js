var httpd = require('http').createServer(handler);
var io = require('socket.io').listen(httpd);
var fs = require('fs');
var _ = require('underscore');
var getUserDetails = require('./backand_to_object').getUserDetails;
var async = require('async');

var redisPort = 6379;
var redisHostname = 'localhost';
//var option = {"auth_pass" : ""};

var redis = require('redis'),
    RedisStore = require('socket.io-redis'),
    pub = redis.createClient(redisPort, redisHostname, option),
    sub = redis.createClient(redisPort, redisHostname, option),
    client = redis.createClient(redisPort, redisHostname, option);


io.adapter(new RedisStore({
    redisPub: pub,
    redisSub: sub,
    redisClient: client
}));

var redisInterface = redis.createClient(redisPort, redisHostname, option);


// socket server

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
        var appName = internal.appName;
        var eventName = internal.eventName;
        io.to(appName).emit(eventName, internal.data);
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

var redisBl = {
    createKey: function (appName) {
        return "|" + appName.toLowerCase();
    },

    getAllUsers: function (appName, callback) {
        client.lrange(this.createKey(appName), 0, -1, function (err, reply) {
            object = [];

            // we have to serialize again all users
            _.each(reply, function (str) {
                object.push(JSON.parse(str));
            });

            callback(err, object);
        });
    },

    getAllUsersByRole: function (appName, role, callback) {
        this.getAllUsers(appName, function (err, object) {
            var filtered = _.where(object, {"role": role});
            callback(err, filtered);
        })
    },

    getUserByList: function (appName, userList, callback) {
        this.getAllUsers(appName, function (err, object) {

            // create intersection between userList and users from store
            var filtered = _.filter(object, function (user) {
                return _.contains(userList, user.username);
            });

            callback(err, filtered);
        })
    },

    removeSocket: function (id, callback) {
        var self = this;
        redisInterface.get(id, function(err, data){
            if(err || data === null){
                return;
            }

            redisInterface.del(id);

            // value exist in redis
            var appName = data;

            self.getAllUsers(appName, function(err, list){
                    var found = _.find(list, function(d) { return d.socketId == id});

                // socket doesn't exist in app Set
                if(found === undefined){
                    return;
                }

                redisInterface.lrem(self.createKey(appName) ,-1,  JSON.stringify(found), function(err, data){
                    callback(err, data);
                });
            });

        });

    },

    saveUser: function (appName, socketId, username, role, callback) {
        var user = {
            socketId: socketId,
            username: username,
            role: role,
        };

        redisInterface.rpush([this.createKey(appName), JSON.stringify(user)], callback);
        redisInterface.set(socketId, appName);
    },

    login: function (socket, appName, username, role) {
        this.saveUser(appName, socket.id, username, role);
        socket.join(appName);
        socket.room = appName;
        socket.emit("authorized");
        console.log("authorized");
    },


    cleanUp: function (callback) {
        client.keys("*", function (err, keys) {
            async.map(keys,
                function(key){ client.del(key)},
                function(err){
                    callback()});
        });
    },
    self : this
}

module.exports.BusinessLogic = redisBl;