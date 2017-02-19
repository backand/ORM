/*jslint node: true */
/*
 Build Version: #build_version#
 */

process.chdir(__dirname);


// for after build change
var version = require('./version').version;

var fs = require('fs');
var _ = require('lodash');
var socketBl = require('./web_sockets/redis_bl')
var config = require('./configFactory').getConfig();
var redisConfig = config.redis;
var httpsConfig = config.socketConfig;
var Logger = require('./logging/log_with_redis');
var logger = new Logger("socketio_" + config.env);

logger.log("start with config " + config.env);

//require('./logging/metrics').monitor();

fs.watchFile(__filename, function(curr,prev) {
    logger.log("close process for update");
    process.exit();
});

var options = {};
var serverAddress = httpsConfig.serverAddress;
var serverPort = httpsConfig.serverPort;

function getClient(roomId) {
    var res = [],
        room = io.sockets.adapter.rooms[roomId];
    if (room) {
        for (var id in room) {
            res.push(io.sockets.adapter.nsp.connected[id]);
        }
    }
    return res;
}

function handler(req, res) {
    fs.readFile(__dirname + req.url,
        function (err, data) {
            if (err) {
                res.writeHead(200);
                return res.end(version);
            }

            res.writeHead(200);
            res.end(data);
        }
    );
    logger.log(req.url);
}

if (httpsConfig.useCertificate) {
    logger.log('user certificate');
    var options = {
        pfx: fs.readFileSync(httpsConfig.pfxPath),
        passphrase: '123456'
    };
}
var httpd;

if (serverAddress.indexOf('https') > -1) { // https
    logger.log('start https server with address ' + serverAddress + ':' + serverPort + " version " + version)
    var httpd = require('https').createServer(options, handler);
} else { // http
    logger.log('start http server with address '+ serverAddress+ ':'+ serverPort + " version " + version);
    var httpd = require('http').createServer(handler);
}

var io = require('socket.io').listen(httpd);
var _ = require('underscore');
var getUserDetails = require('./backand_to_object').getUserDetails;

var redisConfig = require('./configFactory').getConfig().redis;

var redisPort = redisConfig.port;
var redisHostname = redisConfig.hostname;
var option = {return_buffers: true};
var redis = require('redis'),
    RedisStore = require('socket.io-redis'),
    pub = redis.createClient(redisPort, redisHostname, option),
    sub = redis.createClient(redisPort, redisHostname, option),
    client = redis.createClient(redisPort, redisHostname, option);
var redisInterface = redis.createClient(redisPort, redisHostname, {});

redisInterface.on('connect', function () {
    logger.log('redis is connected');
    runSocket();
});

httpd.listen(serverPort);


function runSocket() {

    var redisBl = new socketBl.BusinessLogic(redisInterface);
    logger.log('before adapter');
    io.adapter(new RedisStore({
        pubClient: pub,
        subClient: sub,
        redisClient: client
    }));
    logger.log('after adapter');


    io.sockets.on('connection', function (socket) {
        function sendMultiple(socket, users, event, message) {
            if (users === null || users.length === 0) {
                return;
            }

            _.each(users, function (u) {
                io.to(u.socketId).emit(event, message);
            });

            logger.log('sendMultiple', event, message);

        }

        logger.log("received connection");

        socket.on('login', function (token, anonymousToken, appName) {
            logger.log('login', token, anonymousToken, appName);
            getUserDetails(token, anonymousToken, appName, function (err, details) {

                if (err){
                    logger.log('login err:' + JSON.stringify(err));
                }

                // handle anonymous case
                if (appName === null && details !== null) {
                    appName = details.appName;
                }

                if (err || appName === null) {
                    socket.emit("notAuthorized");
                    return;
                }

                logger.log('success login to ' + appName + ' with user ' + details.username + ' and role ' + details.role);
                redisBl.login(socket, appName, details.username, details.role);
            });
        });

        socket.on('disconnect', function () {
            var id = socket.id;
            redisBl.removeSocket(id, function(err, data){
                logger.log(err);
            });
        })

        socket.on('internalAll', function (internal) {
            var eventName = internal.eventName;
            var appName = internal.appName;
            io.to(appName).emit(eventName, internal.data);
            logger.log('internalAll ' + appName  + ' ' + eventName + ' ' + JSON.stringify(internal.data));
        });

        socket.on('internalRole', function (internal) {
            var appName = internal.appName,
                eventName = internal.eventName,
                role = internal.role,
                data = internal.data;

            if (!appName || !eventName || !role || !eventName) {
                return;
            }

            redisBl.getAllUsersByRole(appName, role, function (err, users) {
                if (err){
                    logger.log('internalRole getAllUsersByRole err:' + JSON.stringify(err));
                }
                else{
                   sendMultiple(appName, users, eventName, data); 
                   logger.log('internalRole ' + appName + ' ' +  eventName +  ' ' + JSON.stringify(internal.data));
                }              
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
                if (err){
                    logger.log('internalUsers getUserByList err:' + JSON.stringify(err));
                }
                else{
                    sendMultiple(appName, users, eventName, data);
                    logger.log('internalUsers ' + appName + ' ' + eventName + ' ' + JSON.stringify(internal.data));
                }         
            });

            

        });


    });

}

