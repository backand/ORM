var AWS = require('aws-sdk')
AWS.config.loadFromPath('../hosting/kornatzky-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var lambda = new AWS.Lambda();

function createLambdaFunctionFromS3(bucket, folder, fileName, functionName, handlerName, callFunctionName, callback){

  var params = {
    Code: { /* required */
      S3Bucket: bucket,
      S3Key: folder + '/' + fileName,
      // S3ObjectVersion: 'STRING_VALUE',
      // ZipFile: new Buffer('...') || 'STRING_VALUE'
    },
    FunctionName: folder + "_" + functionName, /* required */
    Handler: handlerName + "." + callFunctionName, /* required */
    Role: 'arn:aws:iam::328923390206:role/lambda_control', /* required */
    Runtime: 'nodejs', /* required */
    // Description: 'STRING_VALUE',
    MemorySize: 128,
    Publish: true,
    Timeout: 3
  };
  lambda.createFunction(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    callback(err, data);
  });

}

module.exports.createLambdaFunctionFromS3 = createLambdaFunctionFromS3;

