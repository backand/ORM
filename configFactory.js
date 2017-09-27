/**
 * Created by backand on 1/11/16.
 */
var credentials = require('./hosting/aws-credentials.json');

function getConfig(environment){
    var env = environment || process.env.ENV;

    if(env == undefined){
        env = "dev";
    }

    var config = require('./configs/config.' + env + ".js");
    config.env = env;
    config.AWSCredentials = credentials;
    return config;
}


module.exports.getConfig = getConfig;