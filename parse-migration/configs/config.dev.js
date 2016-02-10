//var api_url = "https://api.backand.com";
var api_url = "https://api.backand.com";
//var api_url = "http://localhost:4110";
//var api_url = "http://10.53.109.128:4110";

// for testing
// "http://ec2-52-5-45-182.compute-1.amazonaws.com:8099";

var redis = {
  "port": 10938,
  "hostname": "pub-redis-10938.us-east-1-4.3.ec2.garantiadata.com",
  "option": {"auth_pass": "bell1234"}
};
var auth = {
  'appName' : 'parseconverter',
  'username' : 'relly@backand.com',
  'passworsd' : 'relly2805'
}



var workerId = 10;

module.exports.redis = redis;
module.exports.api_url = api_url;
module.exports.workerId = workerId;
module.exports.authDetail = auth;