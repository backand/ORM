/**
 * Created by backand on 3/27/16.
 */


var unirest = require('unirest');
var url = 'https://api.cooladata.com/v2/ti9p1pqxkanzqrvs8wdz94jv8jcaatag/track';
var dateConvert = require('../utils/timeUtil');

var ERROR_STRIKE = 3; // if fail on 3 consecutive call, wait after next run;


var coolaAppender = function () {
    this.errorStrike = 0;
};


coolaAppender.prototype.processMessage = function (msgBulk, cb) {
    //console.log('start bulk');
    var self = this;
    // have to clone it because we have to add new fields.

    var newMsgBlk = [];
    for (var i = 0; i < msgBulk.length; i++) {
        var msg = msgBulk[i];
        var newMsg = JSON.parse(msg.origin);

        // encrich message
        newMsg.user_id = newMsg.ID ? newMsg.ID.replace(/[^\w\s]/gi, '') : "NA";
        newMsg.event_name = newMsg.MethodName ? newMsg.MethodName.replace(/[^\w\s]/gi, '') : "NA";
        //console.log(newMsg.event_name);
        newMsg.event_timestamp_epoch = dateConvert(newMsg.Time);

        // clean message

        Object.keys(newMsg).forEach(function (key) {
            newMsg[key] = encodeURIComponent(newMsg[key]);
        });
        
        newMsgBlk.push(newMsg);
    }

    var packt = {"events": newMsgBlk};
    packt = JSON.stringify(packt);

    // send to cooladata
    unirest.post(url)
        .header('Content-Type', 'application/x-www-form-urlencoded')
        .send(packt)
        .end(function (res) {
                var parsed;
                try {
                    parsed = JSON.parse(res.raw_body);
                }
                catch (err) {
                    cb();
                }

                if (parsed && parsed.status === false) {
                    console.log('try again');
                    // try again
                    unirest.post(url)
                        .header('Content-Type', 'application/x-www-form-urlencoded')
                        .send(packt)
                        .end(function (res) {
                            console.log(res.raw_body);
                            try {
                                parsed = JSON.parse(res.raw_body);
                            }
                            catch (err) {
                                cb();
                            }

                            if (parsed && parsed.status === false) {

                                self.errorStrike++;

                                if (self.errorStrike === ERROR_STRIKE) {
                                    self.errorStrike = 0;
                                    cb('ERROR_MANY_TIMES');
                                }
                                else {
                                    cb();
                                }
                            }
                            else {
                                cb();
                            }
                        });
                }
                else {
                    cb();
                }

            }
        )
    ;
}
;


module.exports = coolaAppender;
// //
// var app = new coolaAppender()
// var msg = [{
//     origin: `{
//       "Source":"WebApi228",
//       "ID":"testtrans03",
//       "ApplicationName":"localhost:4110",
//       "Username":"relly@backand.com",
//       "MachineName":"DELL-PC",
//       "Time":"3/27/2016 5:57:20 PM",
//       "Controller":"",
//       "Action":"GET",
//       "MethodName":"testtrans01: ",
//       "LogType":"3",
//       "ExceptionMessage":"",
//       "Trace":"",
//       "FreeText":"http://localhost:4110/1/table/dictionary/items/?deep=true&withSystemTokens=true&crud=update",
//       "Guid":"9a195edc-2235-4593-b259-60e38e2b3572",
//       "ClientIP":"::1",
//       "ClientInfo":"origin=http://localhost:3001; host=localhost:4110; referer=http://localhost:3001/; user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0; keys=ALL_HTTP,ALL_RAW,APPL_MD_PATH,APPL_PHYSICAL_PATH,AUTH_TYPE,AUTH_USER,AUTH_PASSWORD,LOGON_USER,REMOTE_USER,CERT_COOKIE,CERT_FLAGS,CERT_ISSUER,CERT_KEYSIZE,CERT_SECRETKEYSIZE,CERT_SERIALNUMBER,CERT_SERVER_ISSUER,CERT_SERVER_SUBJECT,CERT_SUBJECT,CONTENT_LENGTH,CONTENT_TYPE,GATEWAY_INTERFACE,HTTPS,HTTPS_KEYSIZE,HTTPS_SECRETKEYSIZE,HTTPS_SERVER_ISSUER,HTTPS_SERVER_SUBJECT,INSTANCE_ID,INSTANCE_META_PATH,LOCAL_ADDR,PATH_INFO,PATH_TRANSLATED,QUERY_STRING,REMOTE_ADDR,REMOTE_HOST,REMOTE_PORT,REQUEST_METHOD,SCRIPT_NAME,SERVER_NAME,SERVER_PORT,SERVER_PORT_SECURE,SERVER_PROTOCOL,SERVER_SOFTWARE,URL,HTTP_CONNECTION,HTTP_ACCEPT,HTTP_ACCEPT_ENCODING,HTTP_ACCEPT_LANGUAGE,HTTP_AUTHORIZATION,HTTP_HOST,HTTP_REFERER,HTTP_USER_AGENT,HTTP_APPNAME,HTTP_ORIGIN forwarded=",
//       "Refferer":"http://localhost:3001/",
//       "Agent":"Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0",
//       "Languages":"en-US,en;q=0.5",
//       "user_id":"testtrans03",
//       "event_name":"testtrans01: ",
//       "event_timestamp_epoch":1459090640000
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