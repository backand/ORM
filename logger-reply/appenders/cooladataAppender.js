/**
 * Created by backand on 3/27/16.
 */


var unirest = require('unirest');
var url = 'https://api.cooladata.com/v3/ti9p1pqxkanzqrvs8wdz94jv8jcaatag/track';
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


        // clean message

        Object.keys(newMsg).forEach(function (key) {
            if (newMsg[key] === null) {
                newMsg[key] = "";
            }
			if(key!='Time')
                newMsg[key] = newMsg[key].toString().replace(/["]/g, "'").replace(/[:]/g, "").trim();

            // if (key === "ClientIP" || key === "Agent" || key === "Languages" || key === "ClientInfo" || key === "FreeText" || key === "ExceptionMessage") {
            //     newMsg[key] = encodeURI(newMsg[key]);
            // }
        });


        newMsg.event_name = newMsg.ID ? newMsg.ID.replace(/[^\w\s]/gi, '') : "NA";
        newMsg.user_id = newMsg.Username ? newMsg.Username.replace(/[^\w\s]/gi, '') : "NA";
		if(newMsg.user_id=='Guest') {
			newMsg.user_id = newMsg.user_id + '@' + newMsg.event_name;
			newMsg.Username  = newMsg.user_id
		}
        newMsg.event_timestamp_epoch = dateConvert(newMsg.Time);

        newMsgBlk.push(newMsg);
    }


    var packtBefore = {"events": newMsgBlk};
    packt = encodeURIComponent(JSON.stringify(packtBefore)).replace(/'/g,"%27").replace(/"/g,"%22");
    //obj.value = encodeURIComponent(unencoded).replace(/'/g,"%27").replace(/"/g,"%22");

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
                    return;
                }

                // console.log(parsed);
                if (parsed && parsed.status === false) {
                    console.log('try again');
                    console.log(packt);

                    for (var i = 0; i < msgBulk.length; i++) {
                        var msg = msgBulk[i];
                        var newMsg = JSON.parse(msg.origin);


                        Object.keys(newMsg).forEach(function (key) {


                            if (key === "ClientIP" || key === "Agent" || key === "Languages" || key === "ClientInfo" || key === "FreeText" || key === "ExceptionMessage") {
                                newMsg[key] = "";
                            }
                        });

                        newMsgBlk.push(newMsg);
                    }


                    packtBefore = {"events": newMsgBlk};
                    packt = JSON.stringify(packtBefore);

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
                                return;
                            }

                            if (parsed && parsed.status === false) {

                                self.errorStrike++;
                                console.log(packtBefore);
                                if (self.errorStrike === ERROR_STRIKE) {
                                    self.errorStrike = 0;
                                    cb('ERROR_MANY_TIMES');
                                    return;
                                }
                                else {
                                    cb();
                                    return;
                                }
                            }
                            else {
                                self.errorStrike = 0;
                                cb();
                                return;
                            }
                        });
                }
                else {
                    cb();
                    return;
                }

            }
        )
    ;
}
;


module.exports = coolaAppender;
//
// var app = new coolaAppender()
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