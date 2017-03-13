var api_url = "http://localhost:8099";
//var api_url = "http://10.53.109.128:4110";

// for testing
// "http://ec2-52-5-45-182.compute-1.amazonaws.com:8099";

var redis = {
  "port": 6379,
  "hostname": "qa-socket.tv1udw.ng.0001.use1.cache.amazonaws.com"
};

var httpsServerConfig = {
    "serverAddress" : 'http://localhost',
    "serverPort" : '4000',
    "useCertificate" : false,
    "pfxPath" : '',
    "proxyIp" : '10.0.5.92'
}

var storageConfig = {
  "serverProtocol" : 'http'
}

var logging = {
    "bulkSize": 1
}

module.exports.socketConfig = httpsServerConfig;
module.exports.api_url = api_url;
module.exports.redis = redis;
module.exports.storageConfig = storageConfig;
module.exports.logging = logging;