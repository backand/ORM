/**
 * Created by backand on 1/11/16.
 */


function getConfig(environment){
    var env = environment || process.env.ENV;

    if(env == undefined){
        env = "dev";
    }

    var config = require('./configs/config.' + env + ".js");
    config.env = env;
    var credentials = require('./configs/aws-credentials.json');
    
    
    var AWSDefaultConfig = {
        credentials: credentials,
        region: 'us-east-1'
    }
    config.AWSDefaultConfig = AWSDefaultConfig;
    
    return config;
}


module.exports.getConfig = getConfig;