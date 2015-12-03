/*jslint node: true */
/*
 Build Version: #build_version#
 */

var fs = require('fs');
var socketBl = require('./web_sockets/redis_bl')
var config = require('./config');
var redisConfig = config.redis;
var httpsConfig = config.socketConfig;

var configLogger = fs.readFile('./logging/config.json');
var logger = require('./logging/logger').logger(configLogger);

var options = {};
var serverAddress = httpsConfig.serverAddress;
var serverPort = httpsConfig.serverPort;

function handler(req, res) {
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
    console.log(req.url);
}

if (httpsConfig.useCertificate) {
    console.log('user certificate');
    var options = {
        pfx: fs.readFileSync(httpsConfig.pfxPath),
        passphrase: '123456'
    };
}
var httpd;

if (serverAddress.indexOf('https') > -1) { // https
    console.log('start https server with addres ', serverAddress, ':', serverPort)
    var httpd = require('https').createServer(options, handler);
} else { // http
    console.log('start http server with addres ', serverAddress, ':', serverPort)
    var httpd = require('http').createServer(handler);
}

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
    console.log('redis is connected');
    runSocket();
});

httpd.listen(serverPort);


function runSocket() {

    var redisBl = new socketBl.BusinessLogic(redisInterface);

    io.adapter(new RedisStore({
        pubClient: pub,
        subClient: sub,
        redisClient: client
    }));

    io.sockets.on('connection', function (socket) {
        function sendMultiple(socket, users, event, message) {
            if (users === null || users.length === 0) {
                return;
            }

            _.each(users, function (u) {
                io.to(u.socketId).emit(event, message);
            });

            logger.verbose('sendMultiple',users, event, message);

        }

        console.log("received connection");

        socket.on('login', function (token, anonymousToken, appName) {
            logger.info('login', token, anonymousToken, appName);
            getUserDetails(token, anonymousToken, appName, function (err, details) {

                if (err) {
                    socket.emit("notAuthorized");
                    return;
                }

                // handle anonymous case
                if (appName === null) {
                    appName = details.appName;
                }

                logger.info('success login to ' + appName + ' with user' + details.username + ' and role ' + details.role);


                console.log('auth');
                redisBl.login(socket, appName, details.username, details.role);
            });
        });

        socket.on('disconnect', function () {
            var id = socket.id;
            redisBl.removeSocket(id);
            logger.info('success disconnect to id ' + id) ;

        })

        socket.on('internalAll', function (internal) {
            var eventName = internal.eventName;
            var appName = internal.appName;
            io.to(appName).emit(eventName, internal.data);
            logger.info('internalAll', eventName, internal.data);
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
                sendMultiple(appName, users, eventName, data);
            });

            logger.info('internalRole', eventName, internal.data);

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

            logger.info('internalUsers', eventName, internal.data);

        });


    });

}

