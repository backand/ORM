var AWS = require('aws-sdk')
var credsFactory = require('./get_account_credentials');

function deleteLambdaFunctionFromS3(awsRegion, accessKeyId, secretAccessKey, functionName, callback) {
  credsFactory.getAccountCredentials(awsRegion, accessKeyId, secretAccessKey, function (err, credentials) {
    if (err) {
      callback(err, null);
      return;
    }
    AWS.config.update({
      'accessKeyId': credentials.accessKeyId,
      'secretAccessKey': credentials.secretAccessKey,
      'sessionToken': credentials.sessionToken,
      'region': awsRegion
    });
    var lambda = new AWS.Lambda();
    var params = {
      FunctionName: functionName, /* required */
      // Qualifier: 'STRING_VALUE'
    };
    lambda.deleteFunction(params, function (err, data) {
      if (err) console.error(err, err.stack); // an error occurred
      else console.log(data);           // successful response
      callback(err, data);
    });
  });
}

module.exports.deleteLambdaFunctionFromS3 = deleteLambdaFunctionFromS3;