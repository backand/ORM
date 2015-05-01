var journey = require('journey');
var validator = require('./validate_schema').validator;
var transformer = require('./transform').transformer;
var fetcher = require('./backand_to_object').fetchTables;
var executer = require('./execute_sql').executer;
var getConnectionInfo = require('./get_connection_info').getConnectionInfo;

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
        result = transform(data.oldSchema, data.newSchema, data.severity)
        res.send(200, {}, result);
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
        var tokenStructure = null;
        if (req.headers.Authorization){
            tokenStructure = req.headers.Authorization.split(" "); 
            result = fetcher(tokenStructure[1], tokenStructure[0]);
            res.send(200, {}, result);
        }   	   
        else{
            tokenStructure = null;
            res.send(401, {}, null);
        }
    });

    this.post('/connectioninfo').bind(function (req, res, data) {
        var tokenStructure = null;
        if (req.headers.Authorization){
            tokenStructure = req.headers.Authorization.split(" "); 
            getConnectionInfo(tokenStructure[1], tokenStructure[0], data.appName, function(err, result){
                if (!err)
                    res.send(200, {}, result);
                else
                    res.send(500, {}, null);
            });  
        }          
        else{
            tokenStructure = null;
            res.send(401, {}, null);
        }
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
}).listen(8080);