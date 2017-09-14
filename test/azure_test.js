var getFunctionsList = require('../azure/get_functions_list').getFunctionsList;
var invokeFunction = require('../azure/invoke_function').invokeFunction;

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

describe('Test Azure functions', function(){
  it('Get functions list', function(done){
    this.timeout(64000);
    var config = {
        "subscriptionId":"393c86bb-df7c-4e2b-b65c-5d49868640bf",
        "appId": "2714aa2d-8319-49dc-93aa-1d5ead69cd79",
        "password": "16dd4e6d-3eb5-4e36-b41e-4b4eee257b3e",
        "tenant": "fca70269-df49-4f51-81a4-bdcbc7da439e"
    };
        
    getFunctionsList(config.subscriptionId, config.appId, config.tenant, config.password, function(err, data){
      if(err){
        console.error("err", err);
      }
      expect(err).to.be.null;
      expect(data).to.have.any.keys("backand-f3","f100");
      done();
    })
  })

  it('Invoke GET function', function(done){
    this.timeout(64000);
    var payload = {
      "name":"input1",
      "postdata":"just another JSON",
      userProfile: {"username":"itay@backand.io","role":"Admin"}
    }

    invokeFunction('HttpTriggerJS1', 'backand-f3', 'function', 'httpTrigger', 'GET', '', payload, function(err, data){
      if(err){
        console.error("err", err);
      }
      
      expect(err).to.be.null;
      expect(data.Payload).to.be.equal("Hello input1");
      done();
    });
  })

  it('Invoke POST function', function(done){
    this.timeout(64000);
    var payload = {
      "name":"post data",
      "postdata":"just another JSON",
      userProfile: {"username":"itay@backand.io","role":"Admin"}
    }

    invokeFunction('HttpTriggerJS1', 'backand-f3', 'function', 'httpTrigger', 'POST', '', payload, function(err, data){
      if(err){
        console.error("err", err);
      }
      
      expect(err).to.be.null;
      expect(data.Payload).to.be.equal("Hello post data");
      done();
    });
  })

  it('Invoke function with Exception', function(done){
    this.timeout(64000);
    var payload = {
      "postdata":"just another JSON",
      userProfile: {"username":"itay@backand.io","role":"Admin"}
    }

    invokeFunction('HttpTriggerJS1', 'backand-f3', 'function', 'httpTrigger', 'POST', '', payload, function(err, data){
      
      expect(data).to.be.undefined;
      expect(err).to.be.equal("Please pass a name on the query string or in the request body");
      done();
    });
  })
})
