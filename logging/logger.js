/**
 * Created by backand on 12/1/15.
 */

var log4js = require('log4js');

log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'log4js-node-amqp',
            connection: {
                url: "amqp://guest:guest@ec2-52-6-131-8.compute-1.amazonaws.com:5672"
            },
            queue: {
                name: "nodeLog",
                durable: true,
                autoDelete: false
            },
            // this is a space for you to add custom bits to every log message
            additionalInfo: {
                machine: require("os").hostname(),
                applicationName: 'nodeServer'
            }
        }
    ]
});
//
// log4js.configure('./logging/config.json', {});
var getlogger = function (name) {
    return log4js.getLogger(name);
}

module.exports.getLogger = getlogger;