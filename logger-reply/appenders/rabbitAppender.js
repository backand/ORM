/**
 * Created by backand on 3/29/16.
 */
var amqp = require('amqp-coffee');
var async = require('async');

// Wait for connection to become established.

var queueName = 'bLog2';


var rabbitAppender = function () {
    var self = this;
    this.connection = new amqp({host: 'ec2-52-6-131-8.compute-1.amazonaws.com'});
    this.readyToSend = false;
    this.connection.on('ready', function () {
        console.log('ready to sent');
        self.readyToSend = true;
    });

};


rabbitAppender.prototype.processMessage = function (msgBulk, cb) {
    console.log('start');
    var self = this;
    async.each(msgBulk, function (msg, callback) {
        if (self.readyToSend) {
            self.connection.publish("", queueName, msg.origin, {}, function (err) {
                if (err) {
                    console.log(err);
                }

                callback(err);
            });
        }
        else {
            setTimeout(callback, 300);
        }
    }, function (err) {
        // // if any of the file processing produced an error, err would equal that error
        // if (err) {
        //     // One of the iterations produced an error.
        //     // All processing will now stop.
        //     console.log('A file failed to process');
        // } else {
        //     console.log('All files have been processed successfully');
        // }

        cb();
    });
};


module.exports = rabbitAppender;
//
// var app = new rabbitAppender()
// var msg = [{
//     origin: `{
//       "Source":"WebApi","ID":"zappdtstorelocator","ApplicationName":"api.backand.com","Username":"test1234@xyz.com","MachineName":"WIN-GMF9EVCV973","Time":"3/23/2016 11:13:19 AM","Controller":"viewData","Action":"GET","MethodName":"zappdtstorelocator: ","LogType":"3","ExceptionMessage":"","Trace":"","FreeText":"https://api.backand.com/1/objects/Store?relatedObjects=true","Guid":"dbf5b771-a9e2-49e5-b37a-e1558b699448","ClientIP":"79.181.113.205","ClientInfo":"origin=; host=api.backand.com; referer=; user-agent=ZappShopFinder/1.0 CFNetwork/758.3.15 Darwin/15.4.0; keys=ALL_HTTP,ALL_RAW,APPL_MD_PATH,APPL_PHYSICAL_PATH,AUTH_TYPE,AUTH_USER,AUTH_PASSWORD,LOGON_USER,REMOTE_USER,CERT_COOKIE,CERT_FLAGS,CERT_ISSUER,CERT_KEYSIZE,CERT_SECRETKEYSIZE,CERT_SERIALNUMBER,CERT_SERVER_ISSUER,CERT_SERVER_SUBJECT,CERT_SUBJECT,CONTENT_LENGTH,CONTENT_TYPE,GATEWAY_INTERFACE,HTTPS,HTTPS_KEYSIZE,HTTPS_SECRETKEYSIZE,HTTPS_SERVER_ISSUER,HTTPS_SERVER_SUBJECT,INSTANCE_ID,INSTANCE_META_PATH,LOCAL_ADDR,PATH_INFO,PATH_TRANSLATED,QUERY_STRING,REMOTE_ADDR,REMOTE_HOST,REMOTE_PORT,REQUEST_METHOD,SCRIPT_NAME,SERVER_NAME,SERVER_PORT,SERVER_PORT_SECURE,SERVER_PROTOCOL,SERVER_SOFTWARE,URL,HTTP_CONNECTION,HTTP_ACCEPT,HTTP_ACCEPT_ENCODING,HTTP_ACCEPT_LANGUAGE,HTTP_AUTHORIZATION,HTTP_HOST,HTTP_USER_AGENT,HTTP_X_PARSE_APP_BUILD_VERSION,HTTP_X_PARSE_APP_DISPLAY_VERSION,HTTP_X_PARSE_APPLICATION_ID,HTTP_X_PARSE_CLIENT_KEY,HTTP_X_PARSE_CLIENT_VERSION,HTTP_X_PARSE_INSTALLATION_ID,HTTP_X_PARSE_OS_VERSION,HTTP_X_FORWARDED_FOR,HTTP_X_FORWARDED_PORT,HTTP_X_FORWARDED_PROTO forwarded=79.181.113.205","Refferer":null,"Agent":null,"Languages":null
//     }`
// }]
//
//
// function sendMessage() {
//     app.processMessage(msg, sendMessage);
// }
//
//
// sendMessage();