var updateLambda = require('../lambda/update_lambda_function').updateLambdaFunctionFromS3;

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

describe('test full CRUD lambda', function(){
  this.timeout(30 *1000);
  it('can create', function(done){
    var createLambda = require('../lambda/create_lambda_function').createLambdaFunctionFromS3;
    createLambda('hosting.backand.net', 'lambdas', 'three.zip', 'triple', 'index', 'g', function(err, data){

      if(err){
        assert.isTrue(err.message === "Function already exist: lambdas_triple");
      }
      done();
      });
  })
  
  it('can update', function(done){
    updateLambda('hosting.backand.net', 'lambdas', 'three.zip', 'triple', function(err, data){
      assert.isNull(err, 'there was no error');
      done();
    });
  })

  it('can delete' , function(done){
    var deleteLambda = require('../lambda/delete_lambda_function').deleteLambdaFunctionFromS3;

    deleteLambda('lambdas', 'triple', function(err, data){
      assert.isNull(err, 'there was no error');
      done();
    });
  })
})
