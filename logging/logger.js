/**
 * Created by backand on 12/1/15.
 */

var log4js = require('log4js');
log4js.configure('./logging/config.json', {});
var logger = log4js.getLogger();
logger.error("Some debug messages");