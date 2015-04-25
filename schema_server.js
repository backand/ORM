var journey = require('journey');
var validator = require('./validate_schema').validator;
var transformer = require('./transform').transformer;
var fetcher = require('./backand_to_object').fetchTables;

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

    this.post('/json').bind(function (req, res, data) {
    	var tokenStructure = request.headers.Authorization.split(" ");
        result = fetcher(tokenStructure[0], tokenStructure[1]);
        res.send(200, {}, result);
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