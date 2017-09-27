/**
 * Created by itay on 11/13/15.
 */

var credentials = require('../configFactory').getConfig().AWSDefaultConfig.credentials;

var iamRole = 'arn:aws:iam::328923390206:role/hosting';

module.exports.credentials = credentials;
module.exports.iamRole = iamRole;

