request = require('request-json');
var client = request.createClient('http://localhost:9000/');
 
var data = {
  	fileName: "clock.jpg",
  	bucket: "hosting.backand.net",
  	dir: "upload"
};
client.post('deleteFile', data, function(err, res, body) {
  console.log(err);
  console.log(body);
  console.log(res.statusCode);
  process.exit(1);
});