//var api_url = "https://api.backand.com";
//var api_url = "http://localhost:4110";
//var api_url = "http://10.53.109.128:4110";

// for testing
// "http://ec2-52-5-45-182.compute-1.amazonaws.com:8099";

var config = {
    api_url : "http://localhost:4110",
    redis: {
        "port": 10938,
        "hostname": "pub-redis-10938.us-east-1-4.3.ec2.garantiadata.com",
        "option": {"auth_pass": "bell1234"}
    },
    authDetail: {
        'appName': 'parseconverter',
        'username': 'relly@backand.com',
        'passworsd': 'relly2805'
    },
    transformAddress: {
        'host': 'localhost',
        'port': 9000
    },
    interval: 5 * 1000,
    workerId: 10
}


module.exports = config;
