var journey = require('journey');
var validator = require('./validate_schema').validator;
var transformer = require('./transform').transformer;
var fetcher = require('./backand_to_object').fetchTables;
var executer = require('./execute_sql').executer;
var getConnectionInfo = require('./get_connection_info').getConnectionInfo;
var socket = require('socket.io-client')('http://localhost:4000');
var transformJson = require('./json_query_language/nodejs/algorithm').transformJson;

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
        res.send(200, {}, result);
    });

    this.post('/transform').bind(function (req, res, data) {
        //result = transformer(data.oldSchema, data.newSchema, data.severity)
        //res.send(200, {}, result);
        var isValidNewSchema = validator(data.newSchema);
        if (isValidNewSchema.valid){
            result = transformer(data.oldSchema, data.newSchema, data.severity)
            res.send(200, {}, result);
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
                    res.send(400, {}, null);
                }
                else{
                    if (data.withoutValidation){
                        result = transformer(oldSchema, data.newSchema, data.severity)
                        res.send(200, {}, result);
                    }
                    else{
                        // test if new schema is valid
                        var isValidNewSchema = validator(data.newSchema);
                        if (isValidNewSchema.valid){
                            result = transformer(oldSchema, data.newSchema, data.severity)
                            res.send(200, {}, result);
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
                    res.send(200, {}, result);
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
                    res.send(400, {}, null);
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
                    res.send(200, {}, result);
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


    //use for the socket.io

    this.post('/socket/emit').bind(function (req, res, data) {
        console.log("action server:" + data.eventName);
        socket.emit("internal", { "data" : data.data, "appName": req.headers.app, "eventName": data.eventName });
        res.send(200, {}, {});
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