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
var isWin = require('os').platform() === 'win32';
var waitLogs = require(path + 'list-s3/wait_for_cloudwatch_logs').waitLogs;
var filterLogs = require(path + 'list-s3/filter_cloudwatch_logs').filterCloudwatchLogs;
var invokeLambdaAndLog = require(path + 'lambda/invoke_lambda_and_log').invokeLambdaAndLog;

var apiUrl = "https://api.backand.com";

describe("lambda log", function(done){


  var lambdaUrl = null;
  var payload = null;
  var lambdaConsoleMessage = null;
  var startTime = null;
  var endTime = null;
  var requestId = null;
  var file = '../hosting/aws-credentials.json';
  var credentials = jsonfile.readFileSync(file);

  before(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    var commandActionDelete = 'node_modules/backand/bin/backand action delete --object items --action testrunlambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    if (isWin){
      commandActionDelete = commandActionDelete.replace(/node_modules\/backand\/bin\/backand/g, 'node node_modules\\backand\\bin\\backand');
    }
    exec(commandActionDelete, function(err, stdout, stderr) {
      done();
    });
  });

  it("lambda init", function(done){
    this.timeout(64000);
    var commandActionInit = 'node_modules/backand/bin/backand action init --object items --action testrunlambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --template template';
      if (isWin){
          commandActionInit = commandActionInit.replace(/node_modules\/backand\/bin\/backand/g, 'node node_modules\\backand\\bin\\backand');
      }
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
          expect(JSON.parse(bodyObj.Payload)).to.be.deep.equal({"message":"Hello World!"});
          done();
        }
    );

  });

  it("lambda deploy", function(done){
    this.timeout(64000);
    var r = Date.now();
    payload = '{"message":"Hello ' + r + '!"}';
    lambdaConsoleMessage = r + ' ' + _.random(1.2, 5.2) + ' ' + r;
    var options = {
      files: 'items/testrunlambda/index.js',
      from: /var helloWorld = \{"message": "Hello World!"\};/g,
      to: 'var helloWorld = ' + payload + '; console.log("' + lambdaConsoleMessage + '");',
    };
    replace.sync(options);
    var commandActionDeploy = 'node_modules/backand/bin/backand action deploy --object items --action testrunlambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli --folder items/testrunlambda';
      if (isWin){
          commandActionDeploy = commandActionDeploy.replace(/node_modules\/backand\/bin\/backand/g, 'node node_modules\\backand\\bin\\backand');
      }
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
            done();
          }
      );
    });
  });

  it("modified lambda call", function(done){
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
          expect(JSON.parse(bodyObj.Payload)).to.be.deep.equal(JSON.parse(payload));
          done();
        }
    );

  });



  it("invoke", function(done){
    this.timeout(64000);
    invokeLambdaAndLog(
      'us-east-1', 
      credentials.accessKeyId, 
      credentials.secretAccessKey, 
      "arn:aws:lambda:us-east-1:328923390206:function:cli_items_testrunlambda", 
      {}, 
      false,
      function(err, data){
        console.log("IIIIIIIIII");
        console.log(data);
        console.log("HHHHHHHHHH");
        expect(err).to.be.null;
        expect(data.logs).to.not.be.null;
        expect(data.logs).to.not.be.empty;
        expect(data.requestId).to.not.be.null;
        expect(data.requestId).to.not.be.undefined;
        requestId = data.requestId;
        expect(data.startTime).to.not.be.null;
        expect(data.startTime).to.not.be.undefined;
        startTime = data.startTime;
        expect(data.endTime).to.not.be.null;
        expect(data.endTime).to.not.be.undefined;
        endTime = data.endTime;
        done(); 
    });
  });

  it("filter logs", function(done){
    this.timeout(64000);
    filterLogs(
      'us-east-1', 
      credentials.accessKeyId, 
      credentials.secretAccessKey, 
      '/aws/lambda/cli_items_testrunlambda', 
      requestId,
      10000,
      startTime,
      endTime, 
      function(err, logs){
        console.log(err);
        console.log(logs)
        expect(err).to.be.null;
        expect(logs).to.not.be.null;
        expect(logs).to.not.be.empty;
        var a = _.find(logs, function(e){
          return e.message.indexOf(lambdaConsoleMessage) > -1;
        });
        expect(a).to.not.be.undefined;
        done();
      }
    );
  });


  it.skip("waitLogs", function(done){
    this.timeout(30 * 1000 + 100);
    waitLogs(
      'us-east-1', 
      credentials.accessKeyId, 
      credentials.secretAccessKey, 
      '/aws/lambda/cli_items_testrunlambda', 
      requestId,
      10000,
      startTime,
      endTime, 
      1000,
      30,
      function(err, logs){
        expect(err).to.be.null;
        expect(logs).to.not.be.null;
        expect(logs).to.not.be.empty;
        var a = _.find(logs, function(e){
          return e.message.indexOf(lambdaConsoleMessage) > -1;
        });
        expect(a).to.not.be.undefined;
        done();
      }
    );

  });

  after(function(done){
    this.timeout(64000);
    del.sync(['items', '*.zip', '.awspublish-nodejs.backand.io', '.backand-credentials.json']);
    // var commandActionDelete = 'node_modules/backand/bin/backand action delete --object items --action testrunlambda --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 9cf80730-1ab6-11e7-8124-06bcf2b21c8c  --app cli';
    //   if (isWin){
    //       commandActionDelete = commandActionDelete.replace(/node_modules\/backand\/bin\/backand/g, 'node node_modules\\backand\\bin\\backand');
    //   }
    // exec(commandActionDelete, function(err, stdout, stderr) {
    //   done();
    // });
    done();
  });
});