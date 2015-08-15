var journey = require('journey');
var socket = require('socket.io-client')('http://localhost:4000');

//
// Create a Router
//
var router = new(journey.Router)({ filter: authorize });

// placeholder for function to test headers are authorized
function isAuthorized(headers){
  // mockup
  if (!_.contains(["a", "b"], token))
    return false;
  else
    return token; //appName
}

// authorize with headers
function authorize (request, body, cb) {
  console.log(request.headers);
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
    
    this.post('/action').bind(function (req, res, data) {
      console.log(data);
      var appName = isAuthorized(req.headers);
      console.log(appName);
      socket.emit("action", { "content" : data.content, "appName": appName, "action": data.action });
      res.send(200, {}, {});
    });

});

socket.on('connect', function(){
  console.log("connect");
});
socket.on('serverMessage', function(data){
  console.log("serverMessage", data);
});
socket.on('disconnect', function(){
  console.log("disconnect");
});
