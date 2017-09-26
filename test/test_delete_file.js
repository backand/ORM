request = require('request-json');
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

var client = request.createClient('http://localhost:9000/');

describe('delete file tests', function(){
    it('can delete a file', function(done){
      var data = {
          fileName: "clock.jpg",
          bucket: "hosting.backand.net",
          dir: "upload"
      };
      client.post('deleteFile', data, function(err, res, body) {
        console.log(err);
        console.log(body);
        console.log(res.statusCode);
        done();
      });
    })
})
