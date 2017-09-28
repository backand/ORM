// This module call a lambda
var AWS = require('aws-sdk')
var config = require('../configFactory').getConfig();


function callLambdaFunctionFromS3(folder, functionName, payload, callback){
  var lambda = new AWS.Lambda(config.AWSDefaultConfig);
  var params = {
    FunctionName: 'arn:aws:lambda:us-east-1:328923390206:function:' + folder + "_" + functionName, /* required */
    // ClientContext: 'STRING_VALUE',
    InvocationType: 'RequestResponse',
    LogType: 'None',
    Payload: JSON.stringify(payload) // new Buffer('...') || 'STRING_VALUE',
    // Qualifier: 'STRING_VALUE'
  };
  lambda.invoke(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    callback(err, data);
  });

}

module.exports.callLambdaFunctionFromS3 = callLambdaFunctionFromS3;

