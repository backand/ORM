var AWS = require('aws-sdk');
var async = require('async');
var credsFactory = require('./get_account_credentials');

function getLambdaList(awsRegion, accessKeyId, secretAccessKey, callback) {
  try {
    credsFactory.getAccountCredentials(awsRegion, accessKeyId, secretAccessKey, function (err, credentials) {
    if (err){ 
      callback(err, null);
      return ;
    }

      AWS.config.update({
        'accessKeyId': credentials.accessKeyId,
        'secretAccessKey': credentials.secretAccessKey,
        'sessionToken': credentials.sessionToken,
        'region': awsRegion
      });

      
      var lambda = new AWS.Lambda();
      var params = {
        MaxItems: 50
      };
      var results = [];
      var thereIsMore = true;
      async.whilst(
        function () { return thereIsMore; },
        function (callback) {
          lambda.listFunctions(params, function (err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
              callback(err);
            }
            else {
              // successful response
              results = results.concat(data.Functions);
              /*
               data = {
                Functions: [
                ], 
                NextMarker: ""
               }
              */
              params.Marker = data.NextMarker;
              thereIsMore = data.NextMarker;
              callback(err, results);
            }

          });
        },
        function (err, arrayFunctions) {
          /*
            [
              { FunctionName: 'testwebhook13_todo_L71',
                  FunctionArn: 'arn:aws:lambda:us-east-1:328923390206:function:testwebhook13_todo_L71',
                  Runtime: 'nodejs',
                  Role: 'arn:aws:iam::328923390206:role/lambda_control',
                  Handler: 'handler.handler',
                  CodeSize: 2270,
                  Description: '',
                  Timeout: 3,
                  MemorySize: 128,
                  LastModified: '2016-11-27T14:04:32.276+0000',
                  CodeSha256: 'Xf38/JBU2h/N9BBCg0CR1mpw/ItLgsnLI+9SY6AzHTk=',
                  Version: '$LATEST',
                  KMSKeyArn: null },
              { FunctionName: 'testlambda_items_jhjk',
                FunctionArn: 'arn:aws:lambda:us-east-1:328923390206:function:testlambda_items_jhjk',
                Runtime: 'nodejs',
                Role: 'arn:aws:iam::328923390206:role/lambda_control',
                Handler: 'handler.handler',
                CodeSize: 1434,
                Description: '',
                Timeout: 3,
                MemorySize: 128,
                LastModified: '2016-04-21T14:25:04.677+0000',
                CodeSha256: 'BQzc43yud2hsU3Di+DG70x38trDcaquN9UG+g71PVng=',
                Version: '$LATEST',
                VpcConfig: { SubnetIds: [], SecurityGroupIds: [], VpcId: null },
                KMSKeyArn: null },
              { FunctionName: 'todo33353_todo_b1',
                FunctionArn: 'arn:aws:lambda:us-east-1:328923390206:function:todo33353_todo_b1',
                Runtime: 'nodejs',
                Role: 'arn:aws:iam::328923390206:role/lambda_control',
                Handler: 'handler.handler',
                CodeSize: 1993,
                Description: '',
                Timeout: 3,
                MemorySize: 128,
                LastModified: '2016-12-07T16:15:19.648+0000',
                CodeSha256: 'znNRuPd50cACFzHz8ppOqCluiMi/yqxQFQ9ZUmhql4I=',
                Version: '$LATEST',
                KMSKeyArn: null },
                ...
            ]
          */
          callback(err, arrayFunctions);
        }
      );
    });
  
  }
  catch (e) {
    callback(e);
  }

}

module.exports.getLambdaList = getLambdaList;

// getLambdaList('us-east-1', "XXXXXXXXXX", "YYYYYYYYYYYYYYYYYYYYY", function(err, data){//please set awss credentials
//   console.log("=======");
//   console.log(err);
//   console.log(data);
//   process.exit(1);
// });