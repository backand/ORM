/**
 * Created by itay on 11/13/15.
 */

var config = require('../configFactory').getConfig().AWSDefaultConfig;

var credentials = config.AWSDefaultConfig.credentials;

var iamRole = confing.HostingIAMRole;

module.exports.credentials = credentials;
module.exports.iamRole = iamRole;

