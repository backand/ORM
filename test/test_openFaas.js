var getFunctionsList = require('../openFaas/get_functions_list').getFunctionsList;
var invokeFunction = require('../openFaas/invoke_function').invokeFunction;

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

describe.skip('Test openFaas functions', function(){
  it('Get functions list', function(done){
    this.timeout(64000);
    var config = {
      "gateway": "http://localhost:8080"
    };
        
    getFunctionsList(config.gateway, '', 'local-test', function(err, data){
      if(err){
        console.error("err", err);
      }
      expect(err).to.be.null;
      expect(data).to.have.any.keys("local-test");
      done();
    })
  })

  // it('Invoke GET function', function(done){
  //   this.timeout(64000);
  //   var payload = {
  //     "message":"param1",
  //     "postdata":"just another JSON",
  //     userProfile: {"username":"itay@backand.io","role":"Admin"}
  //   }

  //   invokeFunction('http://localhost:8080/function/func_echoit', 'GET', payload, function(err, data){
  //     expect(data).to.be.undefined;
  //     expect(err).to.be.equal("Only support POST method.");
  //     done();
  //   });
  // })

  it('Invoke POST function', function(done){
    this.timeout(64000);
    var payload = {
      "message":"param1",
      "postdata":"just another JSON",
      userProfile: {"username":"itay@backand.io","role":"Admin"}
    }

    invokeFunction('http://localhost:8080/function/func_echoit', 'POST', payload, function(err, data){
      if(err){
        console.error("err", err);
      }
      expect(err).to.be.null;
      expect(data).to.deep.equal({ message: 'param1', postdata: 'just another JSON', userProfile: { username: 'itay@backand.io', role: 'Admin' } });
      done();
    });
  })

  // it('Invoke function with Exception', function(done){
  //   this.timeout(64000);
  //   var payload = {
  //     "error":"param1",
  //     "postdata":"just another JSON",
  //     userProfile: {"username":"itay@backand.io","role":"Admin"}
  //   }

  //   invokeFunction('https://us-central1-functions-179710.cloudfunctions.net/function2', 'POST', payload, function(err, data){
      
  //     expect(data).to.be.undefined;
  //     expect(err).to.be.equal("Some error!");
  //     done();
  //   });
  // })
})
