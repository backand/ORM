/**
 * Created by backand on 3/27/16.
 */

 var async = require('async');

var logEntry = 'log_api';
var RedisDataSource = require('../sources/redisDataSource');

var message = {
    "Source": "WebApi#",
    "ID": "testtrans03",
    "ApplicationName": "localhost:4110",
    "Username": "relly@backand.com",
    "MachineName": "DELL-PC",
    "Time": "3/27/2016 5:57:20 PM",
    "Controller": "",
    "Action": "GET",
    "MethodName": "testtrans01: ",
    "LogType": "3",
    "ExceptionMessage": "",
    "Trace": "",
    "FreeText": "http://localhost:4110/1/table/dictionary/items/?deep=true&withSystemTokens=true&crud=update",
    "Guid": "9a195edc-2235-4593-b259-60e38e2b3572",
    "ClientIP": "::1",
    "ClientInfo": "origin=http://localhost:3001; host=localhost:4110; referer=http://localhost:3001/; user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0; keys=ALL_HTTP,ALL_RAW,APPL_MD_PATH,APPL_PHYSICAL_PATH,AUTH_TYPE,AUTH_USER,AUTH_PASSWORD,LOGON_USER,REMOTE_USER,CERT_COOKIE,CERT_FLAGS,CERT_ISSUER,CERT_KEYSIZE,CERT_SECRETKEYSIZE,CERT_SERIALNUMBER,CERT_SERVER_ISSUER,CERT_SERVER_SUBJECT,CERT_SUBJECT,CONTENT_LENGTH,CONTENT_TYPE,GATEWAY_INTERFACE,HTTPS,HTTPS_KEYSIZE,HTTPS_SECRETKEYSIZE,HTTPS_SERVER_ISSUER,HTTPS_SERVER_SUBJECT,INSTANCE_ID,INSTANCE_META_PATH,LOCAL_ADDR,PATH_INFO,PATH_TRANSLATED,QUERY_STRING,REMOTE_ADDR,REMOTE_HOST,REMOTE_PORT,REQUEST_METHOD,SCRIPT_NAME,SERVER_NAME,SERVER_PORT,SERVER_PORT_SECURE,SERVER_PROTOCOL,SERVER_SOFTWARE,URL,HTTP_CONNECTION,HTTP_ACCEPT,HTTP_ACCEPT_ENCODING,HTTP_ACCEPT_LANGUAGE,HTTP_AUTHORIZATION,HTTP_HOST,HTTP_REFERER,HTTP_USER_AGENT,HTTP_APPNAME,HTTP_ORIGIN forwarded=",
    "Refferer": "http://localhost:3001/",
    "Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0",
    "Languages": "en-US,en;q=0.5"
};

var redisDataSource = new RedisDataSource();
redisDataSource.scan(
    function(data){
        console.log("----");
        console.log(data);
        console.log("====");
    },
    function(err){
        console.log("err");
        console.log(err);
        process.exit(0);
    }
);

async.timesSeries(1000, function(n, next) {
    message.Source = 'WebApi' + n;
    redisDataSource.insertEvent(logEntry, message, function(err, result){
        next(err, result);
    });
}, function(err, a) {
    console.log(err, a);
    process.exit(0);
});
