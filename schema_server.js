process.chdir(__dirname);
var journey = require('journey');
var async = require('async');
var _ = require('underscore');
var AWS = require('aws-sdk')
AWS.config.loadFromPath('./hosting/aws-credentials.json');
var s3 = new AWS.S3();

var mime = require('mime-types');



var validator = require('./validate_schema').validator;
var transformer = require('./transform').transformer;
var renamer = require('./transform').rename;
var applyRename = require('./transform').applyRename;
var fetcher = require('./backand_to_object').fetchTables;
var executer = require('./execute_sql').executer;
var getConnectionInfo = require('./get_connection_info').getConnectionInfo;
var version = require('./version').version;

var config = require('./configFactory').getConfig();
var logger = require('./logging/logger').getLogger("schema_" + config.env);

var bcrypt = require('bcrypt-nodejs');

logger.info("start with config " + config.env);


var socketConfig = config.socketConfig.serverAddress + ':' + config.socketConfig.serverPort;

var socket = require('socket.io-client')(socketConfig);
var transformJson = require('./json_query_language/nodejs/algorithm').transformJson;
var substitute = require('./json_query_language/nodejs/substitution').substitute;
var getTemporaryCredentials = require('./hosting/sts').getTemporaryCredentials;
var gcmSender = require('./push/gcm_sender').sendMessage;

var s3Folders = require('./list-s3/list_folder');

var createLambda = require('./lambda/create_lambda_function').createLambdaFunctionFromS3;
var callLambda = require('./lambda/call_lambda_function').callLambdaFunctionFromS3;
var updateLambda = require('./lambda/update_lambda_function').updateLambdaFunctionFromS3;
var deleteLambda = require('./lambda/delete_lambda_function').deleteLambdaFunctionFromS3;

var putCron = require('./cron/put_cron').putCron;
var deleteCron = require('./cron/delete_cron').deleteCron;
var getCron = require('./cron/get_cron').getCron;

var fs = require('fs');

fs.watchFile(__filename, function (curr, prev) {
    logger.info("close process for update");
    process.exit();
});

//
// Create a Router
//
var router = new (journey.Router)({filter: authorize});

// placeholder for function to test headers are authorized
function isAuthorized(headers) {
    return true;
}

// authorize with headers
function authorize(request, body, cb) {
    return isAuthorized(request.headers)
        ? cb(null)
        : cb(new journey.NotAuthorized('Not Authorized'));
}

// Create the routing table
router.map(function () {
    this.root.bind(function (req, res) {
        res.send("Welcome")
    });

    // validate a json schema
    this.post('/validate').bind(function (req, res, data) {
        logger.info("start validate");
        logger.trace("validate input", data);
        result = validator(data)

        // todo: check it works without stringify
        logger.trace(data);

        if (result.error) {
            logger.info("validate error " + result.error);
            res.send(500, {error: result.error}, {});
        }
        else {
            logger.info("validate OK");
            res.send(200, {}, result);
        }

    });

    // transform one json schema into another json schema
    this.post('/transform').bind(function (req, res, data) {
        logger.info("start transform");
        logger.trace("transform" + " " +  "oldSchema:" + data.oldSchema + " newSchema:" +  data.newSchema + " severity:" + data.severity);
        var isValidNewSchema = validator(data.newSchema);
        logger.trace("isValidNewSchema", isValidNewSchema);

        if (isValidNewSchema.error) {
            logger.info("transform error " + isValidNewSchema.error);
            res.send(500, {error: isValidNewSchema.error}, {});
        }
        else if (isValidNewSchema.valid) {
            var isSpecialPrimary = false;
            if (data.isSpecialPrimary)
                isSpecialPrimary = true;

            // get the statements for the rename
            var resultPlainRename = renamer(data.newSchema);
            // how will the old schema look after the rename
            var renamedOldSchema = applyRename(data.newSchema, data.oldSchema);
            // how will the new schema look after the rename
            var renamedNewSchema = applyRename(data.newSchema, data.newSchema); 
            // transform when both sides already renames so it is the standard transform
            result = transformer(renamedOldSchema, renamedNewSchema, data.severity, isSpecialPrimary);
            // precede the alteration statemtns with the rename stamtents
            result.alter =  resultPlainRename.statements.concat(result.alter);

            logger.trace(result);

            if (result.error) {
                logger.info("transform error " + isValidNewSchema.error);
                res.send(500, {error: isValidNewSchema.error}, {});
            }
            else {
                logger.info("transform OK");
                res.send(200, {}, result);
            }
        }
        else {
            isValidNewSchema.valid = "never";
            logger.info("transform OK never");

            res.send(200, {}, isValidNewSchema);
        }
    });

    // transform a json schema into antoher schema
    this.post('/transformAuthorized').bind(function (req, res, data) {
        logger.info("start transformAuthorized");
        var tokenStructure = getToken(req.headers);
        if (tokenStructure) {
            fetcher(tokenStructure[1], tokenStructure[0], req.headers.appname, true, false, function (err, oldSchema) {
                if (err) {
                    logger.info("error in transformAuthorized " + err);
                    res.send(400, {error: err}, null);
                }
                else {
                    logger.trace("transformer" + " " + oldSchema + " newSchema:" +  data.newSchema + " severity:" +  data.severity)
                    if (data.withoutValidation) {
                        result = transformer(oldSchema, data.newSchema, data.severity)
                        logger.trace(result);

                        if (result.error) {
                            logger.info("error in transformAuthorized " + result.error);
                            res.send(500, {error: result.error}, {});
                        }
                        else {
                            logger.info("OK in transformAuthorized");
                            res.send(200, {}, result);
                        }

                    }
                    else {
                        // test if new schema is valid
                        var isValidNewSchema = validator(data.newSchema);
                        logger.trace("isValidNewSchema", isValidNewSchema);
                        if (isValidNewSchema.error) {
                            logger.info("error in transformAuthorized schema not valid" + result.error);
                            res.send(500, {error: result.error}, {});
                        }
                        else if (isValidNewSchema.valid) {
                            result = transformer(oldSchema, data.newSchema, data.severity)
                            logger.trace(result);
                            if (result.error) {
                                logger.info("error in transformAuthorized schema not valid2" + result.error);
                                res.send(500, {error: result.error}, {});
                            }
                            else {
                                logger.info("OK transformAuthorized");
                                res.send(200, {}, result);
                            }

                        }
                        else {
                            //isValidNewSchema.valid = "never";
                            //res.send(200, {}, result);
                            isValidNewSchema.valid = "never";
                            logger.info("transformAuthorized OK never");
                            res.send(200, {}, isValidNewSchema);
                        }
                    }
                }
            });
        }
        else {
            logger.info("401 on transformAuthorized");
            res.send(401, {}, null);
        }
    });

    // execute an array of sql statements
    this.post('/execute').bind(function (req, res, data) {
        if(data !== undefined) {
            logger.info("start execute " + data.hostname + " " + data.port + " " + data.db + " " + data.username + " " + data.password);
        }

        if (!data.hostname || !data.port || !data.db || !data.username || !data.password) {
            logger.info("send 400 on execute");
            res.send(400, {}, null);
        }
        else {
            logger.trace("db details", data.hostname, data.port, data.db, data.username, data.password, data.statementsArray);
            executer(data.hostname, data.port, data.db, data.username, data.password, data.statementsArray, function (err, result) {
                if (!err) {
                    logger.info("execute result " + err + " " + result);
                    res.send(200, {error: err}, result);
                }
                else {
                    logger.info("execute send 500");
                    res.send(500, {}, null);
                }
            });
        }
    });

    // obtain the json structure for a schema
    this.post('/json').bind(function (req, res, data) {
        logger.info("start json");
        var tokenStructure = getToken(req.headers);
        logger.trace(tokenStructure);

        if (tokenStructure) {
            fetcher(tokenStructure[1], tokenStructure[0], req.headers.appname, false, false, function (err, result) {

                if (err) {
                    logger.info("error in json " + err);
                    res.send(400, {error: err}, null);
                }
                else {
                    logger.info("OK on json " + result);
                    res.send(200, {}, result);
                }

            });

        }
        else {
            logger.info("401 on json");
            res.send(401, {}, null);
        }
    });

    // get database connection info for app
    this.post('/connectioninfo').bind(function (req, res, data) {
        logger.info("start connectioninfo");
        var tokenStructure = getToken(req.headers);
        logger.trace(tokenStructure);

        if (tokenStructure) {
            getConnectionInfo(tokenStructure[1], tokenStructure[0], data.appName, function (err, result) {
                if (!err) {
                    logger.info("result on connectioninfo " + err + " " + result);
                    res.send(200, {error: err}, result);
                }
                else {
                    logger.info("result 500 connectioninfo");
                    res.send(500, {}, null);
                }
            });
        }
        else {
            logger.info("result 401 connectioninfo");
            res.send(401, {}, null);
        }
    });

    // translate json into mysql
    // status code according to result
    // error returned in header
    this.post('/transformJson').bind(function (req, res, data) {
        logger.info("start tranformJson");
        var tokenStructure = getToken(req.headers);
        logger.trace(tokenStructure);

        fetcher(tokenStructure[1], tokenStructure[0], data.appName, true, true, function (err, sqlSchema) {
            if (err) {
                logger.info("transformJson error " + err);
                res.send(500, {error: err}, null);
            }
            else {
                transformJson(data.json, sqlSchema, data.isFilter, data.shouldGeneralize, function (err, result) {
                    logger.info("transformJson result " + err + " " + result);
                    res.send(200, {error: err}, result);
                });
            }
        });

    });

    // substitute variables into query 
    // req should contain sql - the sql statement, and assignment - variable assignment
    this.post('/substitution').bind(function (req, res, data) {
        logger.info("start substitution");
        logger.trace(data.sql, data.assignment);
        substitute(data.sql, data.assignment, function (err, result) {
            logger.info("finish substitution");
            logger.trace(result);
            res.send(200, {}, result);
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
        if(data !== undefined) {
            logger.info("start socket/emit " + data.eventName + " " + data.mode);
        }

        if (data.mode == "All") {
            socket.emit("internalAll", {"data": data.data, "appName": req.headers.app, "eventName": data.eventName});
        }
        else if (data.mode == "Role" && data.role !== null) {
            socket.emit("internalRole", {
                "data": data.data,
                "role": data.role,
                "appName": req.headers.app,
                "eventName": data.eventName
            });
        }
        else if (data.mode == "Users" && data.users !== null) {
            socket.emit("internalUsers", {
                "data": data.data,
                "users": data.users,
                "appName": req.headers.app,
                "eventName": data.eventName
            });
        }
        else if (data.mode == "Others") {
            socket.emit("internalOthers", {"data": data.data, "appName": req.headers.app, "eventName": data.eventName});
        }
        else { // don't understand mode, log error
            logger.error("Can't find valid mode for: " + data);
        }

        logger.info("finish socket emit");
        res.send(200, {}, {});
    });

    // get sts credentials for bucket
    this.post('/bucketCredentials').bind(function (req, res, data) {
        logger.info('start bucketCredentials');
        getTemporaryCredentials(data.bucket, data.dir, function (err, data) {
            if (err) {
                logger.info('bucketCredentials error ' + err);
                res.send(500, {error: err}, {});
            }
            else {
                logger.info('bucketCredentials OK ' + data);
                res.send(200, {}, data);
            }
        });
    });

    // upload a content file to S3
    this.post('/uploadFile').bind(function (req, res, data) {
        logger.info('start uploadFile');
        logger.trace(data.fileName + ' ' + data.dir);
        var s = data.fileName.toLowerCase();
        var extPosition = s.lastIndexOf('.');
        if (extPosition > -1) {
            ext = s.substr(extPosition + 1);
        }
        else {
            ext = '';
        }
        var contentType = data.fileType;

        if (!contentType) {
            contentType = getContentType(data.fileName);
        }

        logger.trace('uploadFile contentType is ' + contentType);

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
            Expires: new Date// || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
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

        logger.trace("uploadFile start put object to s3");
        s3.putObject(params, function (err, awsData) {
            // if (err) console.log(err, err.stack); // an error occurred
            // else     console.log(data);           // successful response
            if (err) {
                logger.info('uploadFile error ' + err);
                res.send(500, {error:err.message}, err);
            }
            else {
                //var link = "https://s3.amazonaws.com/" + data.bucket + "/" + data.dir + "/" + data.fileName;
                var link = config.storageConfig.serverProtocol + '://' + data.bucket + "/" + data.dir + "/" + data.fileName;
                logger.info("uploadFile OK " + link);
                res.send(200, {}, {link: link});
            }
        });


    });

    // delete a content file from S3
    this.post('/deleteFile').bind(function (req, res, data) {
        logger.info('start deleteFile');
        logger.trace(data.bucket, data.fileName);
        var params = {
            Bucket: data.bucket, /* required */
            Key: data.dir + "/" + data.fileName/* required */
        };
        console.log(params);
        s3.deleteObject(params, function (err, data) {
            // if (err) console.log(err, err.stack); // an error occurred
            // else     console.log(data);           // successful response
            if (err) {
                logger.info("deleteFile error " + err);
                res.send(500, {error: err}, {});
            }
            else {
                logger.info("deleteFile OK");
                res.send(200, {}, {});
            }
        });

    });

    // dumb list of sub folder of app
    this.post('/listFolder').bind(function (req, res, data) {
        logger.info("start listFolder");
        logger.trace(data.bucket, data.folder, data.pathInFolder);
        s3Folders.listFolder(data.bucket, data.folder, data.pathInFolder, function(err, files) {
           if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, files);
            }
        });
    });

    this.post('/deleteFolder').bind(function (req, res, data) {
        logger.info("start deleteFolder");
        logger.trace(data.bucket, data.folder);
        s3Folders.deleteFolder(data.bucket, data.folder, function(err) {
           if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, files);
            }
        });
    });

    // smart list with caching of sub folder of app
    this.post('/smartListFolder').bind(function (req, res, data) {
        logger.info("start smartListFolder");
        logger.trace(data.bucket, data.folder, data.pathInFolder);
        s3Folders.filterFiles(data.bucket, data.folder, data.pathInFolder, function(err, filterFilesOutput) {
           if (err){
                if (err != "not stored"){
                    res.send(500, { error: err }, {});
                }
                else{
                    logger.trace("storeFolder");
                    s3Folders.storeFolder(data.bucket, data.folder, function(err){ // fetch and store the whole bucket
                        if (err){
                            res.send(500, { error: err }, {});
                        }
                        else{ // fetch our path
                            s3Folders.filterFiles(data.bucket, data.folder, data.pathInFolder, function(err, filterFilesAfterStoreFolderOutput){
                                if (err){
                                   res.send(500, { error: err }, {}); 
                                }
                                else{
                                   res.send(200, {}, filterFilesAfterStoreFolderOutput);
                                }
                            });
                        }
                    });
                }
            }
            else{
                res.send(200, {}, filterFilesOutput);
            }
        });
    });

    this.post('/createLambda').bind(function (req, res, data) {
        createLambda(data.bucket, data.folder, data.fileName, data.functionName, data.handlerName, data.callFunctionName, function(err, data){
            if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, data);
            }
        })
    });

    this.post('/callLambda').bind(function (req, res, data) {
        callLambda(data.folder, data.functionName, data.payload, function(err, data){
            if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, data);
            }
        })
    });

    this.post('/updateLambda').bind(function (req, res, data) {
        updateLambda(data.bucket, data.folder, data.fileName, data.functionName, function(err, data){
            if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, data);
            }
        })
    });


    this.post('/deleteLambda').bind(function (req, res, data) {
        deleteLambda(data.folder, data.functionName, function(err, data){
            if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, data);
            }
        })
    });

    this.post('/putCron').bind(function (req, res, data) {
        putCron(data.name, data.schedule, data.lambdaArn, data.name, data.input, data.active, data.description, function(err, data){
            if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, data);
            }
        })
    });

    this.post('/deleteCron').bind(function (req, res, data) {
        deleteCron(data.name, data.name, function(err, data){
            if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, data);
            }
        })
    });

    this.post('/getCron').bind(function (req, res, data) {
        getCron(data.namePrefix, function(err, data){
            if (err){
                res.send(500, { error: err }, {});
            }
            else{
                res.send(200, {}, data);
            }
        })
    });

    // send push messages 
    // data has fields: 
    // devices - array of { deviceType, deviceId }
    // gcmOptions - object with field ServerAPIKey
    // apnsOptions - object
    // messageLabel - string
    // msgObject - hash of data to be sent with push notification
    this.post('/push/send').bind(function (req, res, data) {
        logger.info('start push/send');
        // separate into gcm and apns
        async.parallel(
            {
                gcm: function (callback) {

                    if (data.gcmOptions && data.gcmOptions.ServerAPIKey) {
                        var deviceIds = _.filter(data.devices, function (d) {
                            return d.deviceType == 'Android';
                        });
                        gcmSender(data.gcmOptions.ServerAPIKey, deviceIds, data.messageLabel, data.msgObject, function (err) {
                            callback(null, err);
                        });
                    }
                    else {
                        callback(null, "no gcm information");
                    }


                },
                apns: function (callback) {
                    if (data.apnsOptions) {
                        var deviceIds = _.filter(data.devices, function (d) {
                            return d.deviceType == 'iOS';
                        });
                        // sendMessage(data.apnsOptions.ServerAPIKey, deviceIds, data.messageLabel, data.msgObject, function(err){
                        //     callback(null, err);
                        // }); 
                        callback(null, null);
                    }
                    else {
                        callback(null, "no apns information");
                    }

                }
            },

            function (err, results) {
                logger.info("send result " + results);

                // why results is in error?
                res.send(200, {error: results}, {});
            }
        );


    });

    this.post('/parseCheckPassword').bind(function(req,res,data){
        console.log(data);
        var password = data.password
        var hashedPassword = data.hashedPassword;

        if(!password || !hashedPassword){
            res.send(500, { error: 'password and hashedPassword must be fulfilled' }, {});
        }

        bcrypt.compare(password, hashedPassword, function(err, success) {
            if (err) {
                res.send(500, { error: err }, {});
            } else {
                console.log(success);
                if(success){
                    res.send(200, {}, null);
                }
                else {
                    res.send(401, { msg: 'password and hash are not same' }, {});
                }
            }
        });
    })


});

require('http').createServer(function (request, response) {
    //logger.info('start server on port 9000 ' + version);
    var body = "";

    request.addListener('data', function (chunk) {
        body += chunk
    });
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

function getToken(headers) {
    if (headers.Authorization || headers.authorization) {
        var authInfo = headers.Authorization;
        if (!authInfo) {
            authInfo = headers.authorization;
        }
        var tokenStructure = authInfo.split(" ");
        return tokenStructure;
    }
    else {
        return null;
    }
}

function getContentType(fileName){

    var cType = mime.lookup(fileName);

    if(!cType){
        cType = "text/plain";
    }

    return cType;
}
