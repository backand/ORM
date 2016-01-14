/**
 * Created by backand on 1/14/16.
 */
//
// Setup our server to proxy standard HTTP requests
//
process.chdir(__dirname);
var http = require('http'),
    httpProxy = require('http-proxy');
var config = require('./configFactory').getConfig();

var otherServerAddress = config.socketConfig.proxyIp;

var proxy = new httpProxy.createProxyServer({

    target: {
        host: otherServerAddress,
        port: config.socketConfig.serverPort
    }
});

// for production
/*
 var proxy = new httpProxy.createProxyServer({
    ssl: {
        fx: fs.readFileSync(httpsConfig.pfxPath),
        passphrase: '123456'
    },
    target: {
        host: otherServerAddress,
        port: config.socketConfig.serverPort
        }
 });
 */


var proxyServer = http.createServer(function (req, res) {
    proxy.web(req, res);
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {
    console.log('upgrade');
    proxy.ws(req, socket, head);
});

proxyServer.listen(config.socketConfig.serverPort);