var config = {
    api_url: "http://localhost:4110",
    redis: {
        // "port": 10938,
        // "hostname": "pub-redis-10938.us-east-1-4.3.ec2.garantiadata.com",
        // "option": {"auth_pass": "bell1234"}

        // new account at https://app.redislabs.com
        // username: relly@backand.com
        // password: Backand2015
        // resource: backanddev
        "port": 15996,
        "hostname": "redis-15996.c8.us-east-1-4.ec2.cloud.redislabs.com"
        // "port": 6379,
        // "hostname": "localhost"
    },
    transformAddress: {
        'host': 'localhost',
        'port': 9000
    },
    socketConfig: {
        "serverAddress": 'http://localhost',
        "serverPort": '4000',
        "useCertificate": false,
        "pfxPath": ''

    },
    storageConfig: {
        "serverProtocol": 'http'
    },
    logging: {
        "bulkSize": 1
    }
}


module.exports = config;


////var api_url = "https://api.backand.com";
////var api_url = "http://localhost:4110";
////var api_url = "http://10.53.109.128:4110";
//
//// for testing
////// "http://ec2-52-5-45-182.compute-1.amazonaws.com:8099";
////
////var redis = {
////  "port": 10938,
////  "hostname": "pub-redis-10938.us-east-1-4.3.ec2.garantiadata.com",
////  "option": {"auth_pass": "bell1234"}
////};
//
//var httpsServerConfig = {
//    "serverAddress": 'http://localhost',
//    "serverPort": '4000',
//    "useCertificate": false,
//    "pfxPath": ''
//}
//
//var storageConfig = {
//    "serverProtocol": 'http'
//}
