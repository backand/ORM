var api_url = "http://localhost:8099";
//var api_url = "http://10.53.109.128:4110";

// for testing
// "http://ec2-52-5-45-182.compute-1.amazonaws.com:8099";

var redis = {
  "port": 6379,
  "hostname": "qa-socket.tv1udw.ng.0001.use1.cache.amazonaws.com"
};
var auth = {
  'appName' : 'parseconverter',
  'username' : 'itay@backand.com',
  'passworsd' : 'itay1234'
}

var transformAddress = {
  'host' : 'localhost',
  'port' : 9000
}

module.exports.redis = redis;

var workerId = 20;

module.exports.redis = redis;
module.exports.api_url = api_url;
module.exports.workerId = workerId;
module.exports.authDetail = auth;