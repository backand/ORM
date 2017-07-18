var AWS = require('aws-sdk')
var credsFactory = require('./get_account_credentials');

function createLambdaFunctionFromS3(awsRegion, accessKeyId, secretAccessKey, bucket, folder, fileName, functionName, handlerName, callFunctionName, callback) {
  credsFactory.getAccountCredentials(awsRegion, accessKeyId, secretAccessKey, function (err, credentials) {
    if (err) {
      callback(err, null);

    }
    AWS.config.update({
      'accessKeyId': credentials.accessKeyId,
      'secretAccessKey': credentials.secretAccessKey,
      'sessionToken': credentials.sessionToken,
      'region': awsRegion
    });
    var lambda = new AWS.Lambda();
    var params = {
      Code: { /* required */
        S3Bucket: bucket,
        S3Key: folder + '/' + fileName,
        // S3ObjectVersion: 'STRING_VALUE',
        // ZipFile: new Buffer('...') || 'STRING_VALUE'
      },
      FunctionName: functionName, /* required */
      Handler: handlerName + "." + callFunctionName, /* required */
      Role: 'arn:aws:iam::328923390206:role/lambda_control', /* required */
      Runtime: 'nodejs4.3', /* required */
      // Description: 'STRING_VALUE',
      MemorySize: 128,
      Publish: true,
      Timeout: 3
    };
    lambda.createFunction(params, function (err, data) {
      if (err) {
        console.error(err, err.stack); // an error occurred
        if (err.message == "Error occurred while GetObject. S3 Error Code: NoSuchKey. S3 Error Message: The specified key does not exist.") {
          err.message = "Please make sure that you are using the latest Backand CLI version";
        }
      }
      else {
        console.log(data);             // successful response
      }
      callback(err, data);
    });
  });

}

module.exports.createLambdaFunctionFromS3 = createLambdaFunctionFromS3;



