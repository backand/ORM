/**
 * Created by backand on 12/1/15.
 */

var log4js = require('log4js');
log4js.configure('./logging/config.json', {});
var getlogger = function(name) {
    return log4js.getLogger(name);
}

module.exports.getLogger = getlogger;