var AWS = require('aws-sdk')
AWS.config.loadFromPath('./hosting/aws-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var lambda = new AWS.Lambda();

function updateLambdaFunctionFromS3(bucket, folder, fileName, functionName, callback){

  var params = {
    FunctionName: folder + '_' + functionName, /* required */
    Publish: true,
    S3Bucket: bucket,
    S3Key: folder + '/' + fileName,
    // S3ObjectVersion: 'STRING_VALUE',
    // ZipFile: new Buffer('...') || 'STRING_VALUE'
  };
  lambda.updateFunctionCode(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    callback(err, data);
  });

}

module.exports.updateLambdaFunctionFromS3 = updateLambdaFunctionFromS3;