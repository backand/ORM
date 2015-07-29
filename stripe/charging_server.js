var journey = require('journey');


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

// Create the routing table
router.map(function () {
    this.root.bind(function (req, res) { res.send("Welcome") });
    
    this.post('/charge').bind(function (req, res, data) {
      console.log(data);
      chargeStripe(data.amount, data.currency, data.token, data.description, function(err, charge){
        res.send(200, {}, { err: err, charge: charge });
      });
      
    });

});


