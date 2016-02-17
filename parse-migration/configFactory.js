/**
 * Created by backand on 1/11/16.
 */
function getConfig(environemt){
    var env = environemt || process.env.ENV;

    if(env == undefined){
        env = "dev";
    }

    var config = require('./configs/config.' + env + ".js");
    config.env = env;
    return config;
}


module.exports.getConfig = getConfig;