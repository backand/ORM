/**
 * Created by backand on 3/27/16.
 */
var dir ='';
var serverConfig = require('../../configFactory').getConfig().socketConfig;
if(serverConfig.logPath)
	dir = serverConfig.logPath;
var fs = require('fs');
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file


var fileAppender = function () {

};


function checkFileExist(path) {
    try {
        fs.accessSync(path, fs.F_OK);
        return true;
        // Do something
    } catch (e) {
        return false;
        // It isn't accessible
    }
}

function getFileName() {
	
    var path = dir + 'log_0.txt';
    var i = 0;
    while (checkFileExist(path)) {
        path = dir + 'log_' + (i++) + '.txt';
    }

    return path;

}

var fileName = getFileName();

fileAppender.prototype.processMessage = function (msgBulk, cb) {
    var logStream = fs.createWriteStream(fileName, {'flags': 'a'});

    for (var i = 0; i < msgBulk.length; i++) {
        var msg = msgBulk[i];
        logStream.write(msg.origin + ',\n');
    }


    logStream.end();

    cb();
};


module.exports = fileAppender;


// var app = new fileAppender()
// var msg = {
//     origin : `{
//     "Source": "WebApi",
//     "ID": "testtrans03",
//     "ApplicationName": "localhost:4110",
//     "Username": "relly@backand.com",
//     "MachineName": "DELL-PC",
//     "Time": "3/27/2016 5:57:20 PM",
//     "Controller": "",
//     "Action": "GET",
//     "MethodName": "testtrans01: ",
//     "LogType": "3",
//     "ExceptionMessage": "",
//     "Trace": "",
//     "FreeText": "http://localhost:4110/1/table/dictionary/items/?deep=true&withSystemTokens=true&crud=update",
//     "Guid": "9a195edc-2235-4593-b259-60e38e2b3572",
//     "ClientIP": "::1",
//     "ClientInfo": "origin=http://localhost:3001; host=localhost:4110; referer=http://localhost:3001/; user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0; keys=ALL_HTTP,ALL_RAW,APPL_MD_PATH,APPL_PHYSICAL_PATH,AUTH_TYPE,AUTH_USER,AUTH_PASSWORD,LOGON_USER,REMOTE_USER,CERT_COOKIE,CERT_FLAGS,CERT_ISSUER,CERT_KEYSIZE,CERT_SECRETKEYSIZE,CERT_SERIALNUMBER,CERT_SERVER_ISSUER,CERT_SERVER_SUBJECT,CERT_SUBJECT,CONTENT_LENGTH,CONTENT_TYPE,GATEWAY_INTERFACE,HTTPS,HTTPS_KEYSIZE,HTTPS_SECRETKEYSIZE,HTTPS_SERVER_ISSUER,HTTPS_SERVER_SUBJECT,INSTANCE_ID,INSTANCE_META_PATH,LOCAL_ADDR,PATH_INFO,PATH_TRANSLATED,QUERY_STRING,REMOTE_ADDR,REMOTE_HOST,REMOTE_PORT,REQUEST_METHOD,SCRIPT_NAME,SERVER_NAME,SERVER_PORT,SERVER_PORT_SECURE,SERVER_PROTOCOL,SERVER_SOFTWARE,URL,HTTP_CONNECTION,HTTP_ACCEPT,HTTP_ACCEPT_ENCODING,HTTP_ACCEPT_LANGUAGE,HTTP_AUTHORIZATION,HTTP_HOST,HTTP_REFERER,HTTP_USER_AGENT,HTTP_APPNAME,HTTP_ORIGIN forwarded=",
//     "Refferer": "http://localhost:3001/",
//     "Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0",
//     "Languages": "en-US,en;q=0.5"
// }`
// }
// app.processMessage(msg, console.log);
