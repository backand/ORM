// This module call a lambda
var AWS = require('aws-sdk')

function invokeLambdaFunction(awsRegion, accessKeyId, secretAccessKey, functionArn, payload, isProduction, callback){
  AWS.config.update({ 'accessKeyId': accessKeyId, 'secretAccessKey': secretAccessKey, 'region': awsRegion });
  var lambda = new AWS.Lambda();
  var params = {
    FunctionName: functionArn, /* required */
    // ClientContext: 'STRING_VALUE',
    InvocationType: 'RequestResponse',
    LogType: isProduction ? 'None' : 'Tail',
    Payload: JSON.stringify(payload) // new Buffer('...') || 'STRING_VALUE',
    // Qualifier: 'STRING_VALUE'
  };
  lambda.invoke(params, function(err, data) {
    // if (err) console.log(err, err.stack); // an error occurred
    // else     console.log(data);           // successful response
    callback(err, data);
  });

}

module.exports.invokeLambdaFunction = invokeLambdaFunction;
