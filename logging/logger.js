/**
 * Created by backand on 12/1/15.
 */

var log4js = require('log4js');

module.exports.logger = function(json) {
    log4js.configure(json, {});
    var logger = log4js.getLogger();

    return logger;
}
