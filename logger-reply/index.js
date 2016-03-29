process.chdir(__dirname);

var BULK_SIZE = 100;

var fs = require('fs');
var RedisSource = require('./sources/redisDataSource');
var redisSource = new RedisSource();
var CoolaAppender = require('./appenders/cooladataAppender');
var coolaAppender = new CoolaAppender();

var async = require('async');
// var logstashApender = new require('./appenders/logstashAppender')();
var FileApender = require('./appenders/fileAppender');
var fileAppender = new FileApender();
var appenders = [fileAppender, coolaAppender];

var lastMessageTime = new Date();
var bulk = [];


var log4js = require('log4js');
log4js.configure({
    appenders: [
        {type: 'console'}
    ]
});

var logger = log4js.getLogger();
var currentCount = 0;

setInterval(function () {
    var diffMs = (new Date() - lastMessageTime);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

    if (diffMins > 2) {
        process.exit(0);
    }
}, 60 * 1000);

setInterval(function () {
    logger.info(currentCount);
}, 3000);

fs.watchFile(__filename, function (curr, prev) {
    logger.info("close process for update");
    process.exit();
});

var source = redisSource;

function processEvent(appender, event, cb) {
    if (!appender || !event) {
        cb();
    }

    appender.processMessage(event, cb);

}

function mainFunc() {
    //logger.info('start loop');
    source.getEvent(function (err, event) {
        if (err) {
            console.error(err);
        }

        if (err || !event || !event.origin) {
            //logger.info('stop loop before');

            setTimeout(mainFunc, 300);
            return;
        }

        currentCount++;
        lastMessageTime = new Date();

        bulk.push(event);

        if (bulk.length === BULK_SIZE) {

            async.each(appenders, function (appender, cb) {
                processEvent(appender, bulk, cb);
            }, function (err) {
                bulk = [];

                // fail after many attemps to Cooladata,  wait two minutes
                if (err === 'ERROR_MANY_TIMES') {
                    logger.warn('wait two minutes');
                    setTimeout(mainFunc, 2 * 60 * 1000);

                }
                else {
                    setTimeout(mainFunc, 100);
                }
            });
        } else {
            mainFunc();
        }

    });
}

// main loop
setTimeout(mainFunc, 10);