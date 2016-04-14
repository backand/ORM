var AWS = require('aws-sdk')
var zipS3Folder = require('./zip-s3-folder').zipS3Folder;
AWS.config.loadFromPath('./hosting/aws-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var lambda = new AWS.Lambda();

function updateLambdaFunctionFromS3(bucket, folder, fileName, functionName, callback){
  console.log("updateLambdaFunctionFromS3 started");
  console.log("zipS3Folder started");

  zipS3Folder(bucket, folder, fileName, function(err, data){
    if (err){
      console.error(err);
      callback(err, null);
    }
    else{
      
      var params = {
        FunctionName: functionName, /* required */
        Publish: true,
        S3Bucket: bucket,
        S3Key: folder + '/' + fileName,
        // S3ObjectVersion: 'STRING_VALUE',
        // ZipFile: new Buffer('...') || 'STRING_VALUE'
      };
      lambda.updateFunctionCode(params, function(err, data) {
        if (err) console.error(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
        console.log("updateLambdaFunctionFromS3 ended");
        callback(err, data);
      });
    }

  });
}

module.exports.updateLambdaFunctionFromS3 = updateLambdaFunctionFromS3;