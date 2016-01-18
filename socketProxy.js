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
 var http = require('https'),
 fs = require('fs'),
 httpProxy = require('http-proxy');
 var config = require('./configFactory').getConfig();

 var otherServerAddress = config.socketConfig.proxyIp;


 httpProxy.createServer({
 ssl: {
 pfx: fs.readFileSync(config.socketConfig.pfxPath),
 passphrase: ''
 },
 ws : true,
 target: 'https://'+ otherServerAddress +':4000',
 secure: false // Depends on your needs, could be false.
 }).listen(4000);

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