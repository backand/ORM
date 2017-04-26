var AWS = require('aws-sdk')

function deleteLambdaFunctionFromS3(awsRegion, accessKeyId, secretAccessKey, functionName, callback){
  AWS.config.update({ 'accessKeyId': accessKeyId, 'secretAccessKey': secretAccessKey, 'region': awsRegion });
  var lambda = new AWS.Lambda();
  var params = {
    FunctionName: functionName, /* required */
    // Qualifier: 'STRING_VALUE'
  };
  lambda.deleteFunction(params, function(err, data) {
    if (err) console.error(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    callback(err, data);
  });

}

module.exports.deleteLambdaFunctionFromS3 = deleteLambdaFunctionFromS3;