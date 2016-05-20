/**
 * Created by backand on 1/14/16.
 */
//
// Setup our server to proxy standard HTTP requests
//
process.chdir(__dirname);
var http = require('https'),
    fs = require('fs'),
    httpProxy = require('http-proxy');
var config = require('./configFactory').getConfig();

var otherServerAddress = config.socketConfig.proxyIp;


httpProxy.createServer({
  ssl: {
    pfx: fs.readFileSync(config.socketConfig.pfxPath),
    passphrase: '123456'
  },
  ws : true,
  target: 'https://'+ otherServerAddress +':4000',
  secure: false // Depends on your needs, could be false.
}).on('error', function(e) {
  console.log(JSON.stringify(e, null, ' '))
}).listen(4000);

/*
 console.log('start server on port: ' + config.socketConfig.serverPort + ' to ' + otherServerAddress);
 // for production

 var options = {
 pfx: fs.readFileSync(config.socketConfig.pfxPath),
 passphrase: '123456'
 };

 var proxy = new httpProxy.createProxyServer({
 ssl: {
 fx: fs.readFileSync(config.socketConfig.pfxPath),
 passphrase: '123456'
 },
 secure : true,
 target: {
 host: otherServerAddress,
 port: config.socketConfig.serverPort
 }
 });



 var proxyServer = http.createServer(options,function (req, res) {
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

 proxyServer.listen(config.socketConfig.serverPort);*/
