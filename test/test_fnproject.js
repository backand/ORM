var getFunctionsList = require('../fnproject/get_functions_list').getFunctionsList;
var invokeFunction = require('../fnproject/invoke_function').invokeFunction;

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

describe('Test fnproject functions', function(){
  it('Get functions list', function(done){
    this.timeout(64000);
    var config = {
      "gateway": "http://functions.backand.com:8080"
    };
        
    getFunctionsList(config.gateway, '', function(err, data){
      if(err){
        console.error("err", err);
      }
      expect(err).to.be.null;
      expect(data).to.have.any.keys("myapp");
      done();
    })
  })

  it('Invoke GET function', function(done){
    this.timeout(64000);
    var payload = {
      "message":"param1",
      "postdata":"just another JSON",
      userProfile: {"username":"itay@backand.io","role":"Admin"}
    }

    invokeFunction('http://functions.backand.com:8080/r/helloapp', 'GET', payload, function(err, data){
      expect(err).to.be.null;
      expect(data).to.be.contains('html')
      done();
    });
  })

  it('Invoke POST function', function(done){
    this.timeout(64000);
    var payload = {
      "url":"www.google.com",
      "postdata":"just another JSON",
      userProfile: {"username":"itay@backand.io","role":"Admin"}
    }

    invokeFunction('http://functions.backand.com:8080/r/myapp/get_rank', 'POST', payload, function(err, data){
      if(err){
        console.error("err", err);
      }
      expect(err).to.be.null;
      expect(data.rank).to.be.equal('1');
      done();
    });
  })

  it('Invoke function with Exception', function(done){
    this.timeout(64000);
    var payload = {
      "error":"param1",
      "postdata":"just another JSON",
      userProfile: {"username":"itay@backand.io","role":"Admin"}
    }

    invokeFunction('http://functions.backand.com:8080/r/myapp/get_rank', 'GET', payload, function(err, data){
      
      expect(data).to.be.undefined;
      expect(err).to.be.contains('container exit code 1');
      done();
    });
  })
})
