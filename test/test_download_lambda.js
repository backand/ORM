process.chdir(__dirname);
var path = process.env.TESTPATH || '../';

var expect = require('chai').expect;
var exec = require('child_process').exec;
var https = require('https');
var fs = require('fs');
var del = require('del');
var _ = require('lodash');
var jsonfile = require('jsonfile');

var getLambdaFunction = require(path + 'lambda/get_lambda_function').getLambdaFunction;

describe("download lambda", function(done){

  var functionSourceUrl = null;
  var sourceSize = -1;
  var path = 'tmp';

  before(function(done){
    this.timeout(64000);
    del.sync(['tmp', 'testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandFunctionDelete = 'bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandFunctionDelete, function(err, stdout, stderr) {
      done();
    });
  });

  it("function init", function(done){
    this.timeout(64000);
    var commandFunctionInit = 'node_modules/backand/bin/backand function init --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --template template';
    exec(commandFunctionInit, function(err, stdout, stderr) {
      functionUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The function was deployed and can be tested at '); }).replace(/The function was deployed and can be tested at /, '');
      // test files exist
      fs.readdir('testclifunction', (err, files) => {
        var functionFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
        expect(Array.isArray(files)).to.be.true;
        var theSame = _.difference(files, functionFiles).length == 0 && _.difference(functionFiles, files).length == 0;
        expect(theSame).to.be.true;
        done();
      });
    });
  });

  it("get function", function(done){
  	this.timeout(64000);
  	var credentials = jsonfile.readFileSync('../hosting/aws-credentials.json');
  	getLambdaFunction('us-east-1', credentials.accessKeyId, credentials.secretAccessKey, 'cli__root_testclifunction', function(err, results){
  		expect(err).to.be.null;
  		expect(results.Code.Location).to.not.be.null;
  		expect(results.Configuration.CodeSize).to.not.be.equal(0);
  		functionSourceUrl = results.Code.Location;
  		sourceSize = results.Configuration.CodeSize;
  		done();
  	});
  });

  it("download zip", function(done){
  	this.timeout(64000);
  	https.get(functionSourceUrl, function(response) {
  	  expect(response.statusCode).to.be.equal(200);
      if (response.statusCode === 200) {
        var file = fs.createWriteStream(path);
        var res = response.pipe(file);
        res.on('finish', function(){
        	fs.lstat(path, function(err, stats){
        		expect(stats.isFile()).to.be.true;
        		expect(stats.size).to.be.equal(sourceSize);
        		done();
        	});      
        })
      }
      else {
        done();
      }

    });
  });

  after(function(done){
    this.timeout(64000);
    del.sync(['tmp', 'testclifunction', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandActionDelete = 'node_modules/backand/bin/backand function delete --name testclifunction --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandActionDelete, function(err, stdout, stderr) {
      done();
    });
  });
});

