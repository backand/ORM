var AWS = require('aws-sdk')
AWS.config.loadFromPath('./hosting/aws-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var lambda = new AWS.Lambda();

function updateLambdaFunctionFromS3(awsRegion, accessKeyId, secretAccessKey, bucket, folder, fileName, functionName, callback){

  var params = {
    FunctionName: functionName, /* required */
    Publish: true,
    S3Bucket: bucket,
    S3Key: folder + '/' + fileName,
    // S3ObjectVersion: 'STRING_VALUE',
    // ZipFile: new Buffer('...') || 'STRING_VALUE'
  };
  lambda.updateFunctionCode(params, function(err, data) {
    if (err) {
      console.error(err, err.stack);
      if (err.message == "Error occurred while GetObject. S3 Error Code: NoSuchKey. S3 Error Message: The specified key does not exist."){
        err.message = "Please make sure that you are using the latest Backand CLI version";
      }
    } // an error occurred
    else     {
      console.log(data);
    }           // successful response
    console.log("updateLambdaFunctionFromS3 ended");
    callback(err, data);
  });
  
}

module.exports.updateLambdaFunctionFromS3 = updateLambdaFunctionFromS3;