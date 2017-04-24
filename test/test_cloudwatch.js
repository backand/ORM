process.chdir(__dirname);
var path = process.env.TESTPATH || '../';

var expect = require("chai").expect;
var exec = require('child_process').exec;
var request = require('request');
var fs = require('fs');
var del = require('del');
var _ = require('lodash');
var jsonfile = require('jsonfile');
var replace = require('replace-in-file');
var async = require('async');
var filterLambdaLogs = require(path + 'list-s3/filter_cloudwatch_logs').filterCloudwatchLogs;

var apiUrl = "https://api.backand.com";

describe("lambda log", function(done){


  var lambdaUrl = null;
  var lambdaConsoleMessage = null;

  before(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandActionDelete = 'node_modules/backand/bin/backand action delete --object items --action testrunlambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandActionDelete, function(err, stdout, stderr) {
      done();
    });
  });

  it("lambda init", function(done){
    this.timeout(64000);
    var commandActionInit = 'node_modules/backand/bin/backand action init --object items --action testrunlambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --template template';
    exec(commandActionInit, function(err, stdout, stderr) {
      var lines = stdout.split('\n');
      lambdaUrl = _.find(stdout.split('\n'), function(s) { return _.startsWith(s, 'The action was deployed and can be tested at '); }).replace(/The action was deployed and can be tested at /, '');
      // test files exist
      fs.readdir('items/testrunlambda', (err, files) => {
        var lambdaFiles = ['debug.js', 'handler.js', 'index.js', 'package.json'];
        expect(Array.isArray(files)).to.be.true;
        var theSame = _.difference(files, lambdaFiles).length == 0 && _.difference(lambdaFiles, files).length == 0;
        expect(theSame).to.be.true;
        done();
      });

    });
  });

  it("lambda deploy", function(done){
    this.timeout(64000);
    var r = Date.now();
    lambdaConsoleMessage = '{"message":"Hello ' + r + '!"}';
    var options = {
      files: 'items/testrunlambda/index.js',
      from: /var helloWorld = \{"message": "Hello World!"\};/g,
      to: 'var helloWorld = {"message": "Hello ' + r + '!"}; console.log(helloWorld);',
    };
    replace.sync(options);
    var commandActionDeploy = 'node_modules/backand/bin/backand action deploy --object items --action testrunlambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --folder items/testrunlambda';
    exec(commandActionDeploy, function(err, stdout, stderr) {
      request.get(apiUrl + '/1/objects/action/items/?name=testrunlambda&parameters={}',
          {
            auth: {
              'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
              'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
            }
          },
          function(err, response, body){
            expect(err).to.be.null;
            var bodyObj = JSON.parse(body);
            expect(bodyObj.StatusCode).to.be.equal(200);
            expect(bodyObj.Payload).to.be.equal(lambdaConsoleMessage);
            done();
          }
      );
    });
  });

  it("lambda call", function(done){
    this.timeout(64000);
    request.get(apiUrl + '/1/objects/action/items/?name=testrunlambda&parameters={}',
        {
          auth: {
            'user': 'b83f5c3d-3ed8-417b-817f-708eeaf6a945',
            'pass': '9cf80730-1ab6-11e7-8124-06bcf2b21c8c'
          }
        },
        function(err, response, body){
          expect(err).to.be.null;
          var bodyObj = JSON.parse(body);
          expect(bodyObj.StatusCode).to.be.equal(200);
          expect(bodyObj.Payload).to.be.equal(lambdaConsoleMessage);
          done();
        }
    );

  });

  it("filter lambda log", function(done){
    this.timeout(10 * 60 * 1000);
    var file = '../hosting/aws-credentials.json';
    var credentials = jsonfile.readFileSync(file);
    var filterPattern = lambdaConsoleMessage.replace(/\{"message":"Hello /g, '').replace(/!"\}/g, '');
    setTimeout(function(){
      filterLambdaLogs('us-east-1', credentials.accessKeyId, credentials.secretAccessKey, '/aws/lambda/cli_items_testrunlambda', filterPattern, function(err, data){
        expect(err).to.be.null;
        expect(data).to.not.be.null;
        expect(data).to.not.be.empty;
        var a = _.find(data, function(e){
          return e.message.indexOf(filterPattern) > -1;
        });
        expect(a).to.not.be.undefined;
        done();       
      });      
    }, 5 * 60 * 1000);
  });

  after(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandActionDelete = 'node_modules/backand/bin/backand action delete --object items --action testrunlambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    exec(commandActionDelete, function(err, stdout, stderr) {
      done();
    });
  });
});