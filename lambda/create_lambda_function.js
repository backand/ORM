var AWS = require('aws-sdk')
var config = require('../configFactory').getConfig();


function createLambdaFunctionFromS3(bucket, folder, fileName, functionName, handlerName, callFunctionName, callback){
  var lambda = new AWS.Lambda(config.AWSDefaultConfig);
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
    MemorySize: 1024,
    Publish: true,
    Timeout: 60
  };
  lambda.createFunction(params, function(err, data) {
    if (err) {
      console.error(err, err.stack); // an error occurred
      if (err.message == "Error occurred while GetObject. S3 Error Code: NoSuchKey. S3 Error Message: The specified key does not exist."){
        err.message = "Please make sure that you are using the latest Backand CLI version";
      }
    }
    else {
      console.log(data);             // successful response
    }
    callback(err, data);
  });
  
}

module.exports.createLambdaFunctionFromS3 = createLambdaFunctionFromS3;



