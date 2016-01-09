var AWS = require('aws-sdk')
AWS.config.loadFromPath('../hosting/kornatzky-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var lambda = new AWS.Lambda();

function deleteLambdaFunctionFromS3(folder, functionName, callback){

  var params = {
    FunctionName: folder + '_' + functionName, /* required */
    // Qualifier: 'STRING_VALUE'
  };
  lambda.deleteFunction(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    callback(err, data);
  });

}

module.exports.deleteLambdaFunctionFromS3 = deleteLambdaFunctionFromS3;