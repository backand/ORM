var journey = require('journey');
var async = require('async');
var _ = require('underscore');
var AWS = require('aws-sdk')
AWS.config.loadFromPath('./hosting/kornatzky-credentials.json');
var s3 = new AWS.S3();



var validator = require('./validate_schema').validator;
var transformer = require('./transform').transformer;
var fetcher = require('./backand_to_object').fetchTables;
var executer = require('./execute_sql').executer;
var getConnectionInfo = require('./get_connection_info').getConnectionInfo;

var config = require('./config');
var socketConfig = config.socketConfig.serverAddress + ':' + config.socketConfig.serverPort;

var socket = require('socket.io-client')(socketConfig);
var transformJson = require('./json_query_language/nodejs/algorithm').transformJson;
var substitute = require('./json_query_language/nodejs/substitution').substitute;
var getTemporaryCredentials = require('./hosting/sts').getTemporaryCredentials;
var gcmSender = require('./push/gcm_sender').sendMessage;

//
// Create a Router
//
var router = new(journey.Router)({ filter: authorize });

// placeholder for function to test headers are authorized
function isAuthorized(headers){
	return true;
}

// authorize with headers
function authorize (request, body, cb) {
  return isAuthorized(request.headers)
      ? cb(null)
      : cb(new journey.NotAuthorized('Not Authorized'));
}

// Create the routing table
router.map(function () {
    this.root.bind(function (req, res) { res.send("Welcome") });
    
    this.post('/validate').bind(function (req, res, data) {
        result = validator(data)
        if (result.error){
            res.send(500, { error: result.error }, {});
        }
        else{
           res.send(200, {}, result); 
        }
        
    });

    this.post('/transform').bind(function (req, res, data) {

        var isValidNewSchema = validator(data.newSchema);
        if (isValidNewSchema.error){
            res.send(500, { error: isValidNewSchema.error }, {});
        }
        else if (isValidNewSchema.valid){
            result = transformer(data.oldSchema, data.newSchema, data.severity)

            if (result.error){
                res.send(500, { error: isValidNewSchema.error }, {});
            }
            else{
                res.send(200, {}, result);
            }
            
        }
        else{
            isValidNewSchema.valid = "never";
            res.send(200, {}, isValidNewSchema);
        }
    });

    this.post('/transformAuthorized').bind(function (req, res, data) {
        var tokenStructure = getToken(req.headers);
        if (tokenStructure){
            fetcher(tokenStructure[1], tokenStructure[0], req.headers.appname, true, false, function(err, oldSchema){
                if (err){
                    res.send(400, { error: err }, null);
                }
                else{
                    if (data.withoutValidation){
                        result = transformer(oldSchema, data.newSchema, data.severity)
                        if (result.error){
                            res.send(500, { error: result.error }, {});
                        }
                        else{
                            res.send(200, {}, result); 
                        }
                        
                    }
                    else{
                        // test if new schema is valid
                        var isValidNewSchema = validator(data.newSchema);
                        if (isValidNewSchema.error){
                            res.send(500, { error: result.error }, {});
                        }
                        else if (isValidNewSchema.valid){
                            result = transformer(oldSchema, data.newSchema, data.severity)
                            if (result.error){
                                res.send(500, { error: result.error }, {});
                            }
                            else{
                                res.send(200, {}, result);  
                            }
                            
                        }
                        else{
                            //isValidNewSchema.valid = "never";
                            //res.send(200, {}, result);
                            isValidNewSchema.valid = "never";
                            res.send(200, {}, isValidNewSchema);
                        }
                    }
                }
            });
        } 
        else{
            res.send(401, {}, null);
        }   
    });

    this.post('/execute').bind(function (req, res, data) {
        if (!data.hostname || !data.port || !data.db || !data.username || !data.password){
           res.send(400, {}, null); 
        }
        else{
            executer(data.hostname, data.port, data.db, data.username, data.password, data.statementsArray, function(err, result){
                if (!err)
                    res.send(200, { error : err }, result);
                else
                    res.send(500, {}, null);
            });  
        }
    });

    this.post('/json').bind(function (req, res, data) {
        var tokenStructure = getToken(req.headers);
        if (tokenStructure){
            fetcher(tokenStructure[1], tokenStructure[0], req.headers.appname, false, false, function(err, result){

                if (err){
                    res.send(400, { error: err }, null);
                }
                else{
                    res.send(200, {}, result);
                }
                
            });
            
        }
        else{
            res.send(401, {}, null);
        }
    });

    this.post('/connectioninfo').bind(function (req, res, data) {
        var tokenStructure = getToken(req.headers);
        if (tokenStructure){          
            getConnectionInfo(tokenStructure[1], tokenStructure[0], data.appName, function(err, result){
                if (!err)
                    res.send(200, { error: err }, result);
                else
                    res.send(500, {}, null);
            });  
        }          
        else{
            res.send(401, {}, null);
        }
    });

    // translate json into mysql
    // status code according to result
    // error returned in header
    this.post('/transformJson').bind(function (req, res, data) {
        var tokenStructure = getToken(req.headers);
        fetcher(tokenStructure[1], tokenStructure[0], data.appName, true, true, function(err, sqlSchema){
            if (err){
                res.send(500, { error: err }, null);
            }
            else{
                transformJson(data.json, sqlSchema, data.isFilter, data.shouldGeneralize, function(err, result){
                    res.send(200, { error: err }, result);
                });
            }
        });

    });

    // substitute variables into query 
    // req should contain sql - the sql statement, and assignment - variable assignment
    this.post('/substitution').bind(function (req, res, data) {
        substitute(data.sql, data.assignment, function(err, result){
            res.send(200, {  }, result);
        });
    });

    //use for the socket.io
    /*
        data.mode can heve 4 modes.
        "All", "Role", "Users", "Others"

        All - send to all users of the App.

        Role - a specific role should be specified at "role"

        Users - an array of users should be specified at "users"

        Others - send to others that sender.
     */
    this.post('/socket/emit').bind(function (req, res, data) {
        console.log("action server:" + data.eventName);
        console.log(data)

        if(data.mode == "All"){
            socket.emit("internalAll", { "data" : data.data,  "appName": req.headers.app, "eventName": data.eventName });
        }
        else if(data.mode == "Role" && data.role !== null){
            socket.emit("internalRole", { "data" : data.data, "role" : data.role,  "appName": req.headers.app, "eventName": data.eventName });
        }
        else if(data.mode == "Users" && data.users !== null){
            socket.emit("internalUsers", { "data" : data.data, "users" : data.users,  "appName": req.headers.app, "eventName": data.eventName });
        }
        else if(data.mode == "Others"){
            socket.emit("internalOthers", { "data" : data.data,  "appName": req.headers.app, "eventName": data.eventName });
        }
        else { // don't understand mode, log error
            console.log("Can't find valid mode for: ", data);
        }
        res.send(200, {}, {});
    });

    this.post('/bucketCredentials').bind(function (req, res, data) {
        getTemporaryCredentials(data.bucket, data.dir, function(err, data){
            if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, data);
            }
        });
    });

    this.post('/uploadFile').bind(function (req, res, data) {
        var s = data.fileName.toLowerCase();
        var extPosition = s.lastIndexOf('.');
        if (extPosition > -1){
            ext = s.substr(extPosition + 1);
        }
        else{
            ext = '';
        }
        var contentType = data.fileType;
        if (!contentType){
            switch (true) {
                case /css/.test(ext):
                    contentType = "text/css";
                break;
                case /js/.test(ext):
                    contentType = "text/js";
                break;
                case /jpg/.test(ext):
                    contentType = "image/jpg";
                break;
                case /ico/.test(ext):
                    contentType = "image/x-icon";
                break;
                case /jpeg/.test(ext):
                    contentType = "image/jpg";
                break;
                case /gif/.test(ext):
                    contentType = "image/gif";
                break;
                case /png/.test(ext):
                    contentType = "image/png";
                break;
                case /html/.test(ext):
                    contentType = "text/html";
                break;
                default:
                    contentType = "text/plain";
                break;
            }
        }

        var buffer = new Buffer(data.file, 'base64');
        var params = {
            Bucket: data.bucket,
              Key: data.dir + "/" + data.fileName,
              ACL: 'public-read',
              Body: buffer,
              // CacheControl: 'STRING_VALUE',
              // ContentDisposition: 'STRING_VALUE',
              // ContentEncoding: 'STRING_VALUE',
              // ContentLanguage: 'STRING_VALUE',
              // ContentLength: 0,
              // ContentMD5: 'STRING_VALUE',
              ContentType: contentType,
              Expires: new Date,// || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
              // GrantFullControl: 'STRING_VALUE',
              // GrantRead: 'STRING_VALUE',
              // GrantReadACP: 'STRING_VALUE',
              // GrantWriteACP: 'STRING_VALUE',
              // Metadata: {
              //   someKey: 'STRING_VALUE',
              //   /* anotherKey: ... */
              // },
              // RequestPayer: 'requester',
              // SSECustomerAlgorithm: 'STRING_VALUE',
              // SSECustomerKey: new Buffer('...') || 'STRING_VALUE',
              // SSECustomerKeyMD5: 'STRING_VALUE',
              // SSEKMSKeyId: 'STRING_VALUE',
              // ServerSideEncryption: 'AES256 | aws:kms',
              // StorageClass: 'STANDARD | REDUCED_REDUNDANCY | STANDARD_IA',
              // WebsiteRedirectLocation: 'STRING_VALUE'
        };
        s3.putObject(params, function(err, awsData) {
            // if (err) console.log(err, err.stack); // an error occurred
            // else     console.log(data);           // successful response
            if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, { link: "https://s3.amazonaws.com/" + data.bucket + "/" + data.dir + "/" + data.fileName });
            }
        });


    });

    this.post('/deleteFile').bind(function (req, res, data) {

        var params = {
            Bucket: data.bucket, /* required */
            Key:  data.dir + "/" + data.fileName/* required */
        };
        console.log(params);
        s3.deleteObject(params, function(err, data) {
            // if (err) console.log(err, err.stack); // an error occurred
            // else     console.log(data);           // successful response
           if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, {  });
            }
        });

    });

    // send push messages 
    // data has fields: 
    // devices - array of { deviceType, deviceId }
    // gcmOptions - object with field ServerAPIKey
    // apnsOptions - object
    // messageLabel - string
    // msgObject - hash of data to be sent with push notification
    this.post('/push/send').bind(function (req, res, data) {
        
        // separate into gcm and apns
        async.parallel(

            { 
                gcm: function(callback){
                    
                    if (data.gcmOptions && data.gcmOptions.ServerAPIKey){
                        var deviceIds = _.filter(data.devices, function(d){ 
                            return d.deviceType == 'Android'; 
                        });
                        gcmSender(data.gcmOptions.ServerAPIKey, deviceIds, data.messageLabel, data.msgObject, function(err){
                            callback(null, err);
                        });  
                    }
                    else{
                        callback(null, "no gcm information");
                    }

                    
                }, 
                apns: function(callback){
                    if (data.apnsOptions){
                        var deviceIds = _.filter(data.devices, function(d){ 
                            return d.deviceType == 'iOS'; 
                        });
                        // sendMessage(data.apnsOptions.ServerAPIKey, deviceIds, data.messageLabel, data.msgObject, function(err){
                        //     callback(null, err);
                        // }); 
                        callback(null, null); 
                    }
                    else{
                        callback(null, "no apns information");
                    }
                    
                }
            },

            function(err, results) {
                res.send(200, { error: results }, {});
            }

        );

        
    });



});

require('http').createServer(function (request, response) {
    var body = "";

    request.addListener('data', function (chunk) { body += chunk });
    request.addListener('end', function () {
        //
        // Dispatch the request to the router
        //
        router.handle(request, body, function (result) {
            response.writeHead(result.status, result.headers);
            response.end(result.body);
        });
    });
}).listen(9000);

function getToken(headers){
    if (headers.Authorization || headers.authorization){
        var authInfo = headers.Authorization;
        if (!authInfo){
            authInfo = headers.authorization;
        }
        var tokenStructure = authInfo.split(" ");
        return tokenStructure;
    } 
    else{
        return null;
    } 
}