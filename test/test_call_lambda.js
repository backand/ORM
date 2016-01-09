var AWS = require('aws-sdk')
AWS.config.loadFromPath('../hosting/kornatzky-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var lambda = new AWS.Lambda();

var params = {
  FunctionName: 'arn:aws:lambda:us-east-1:328923390206:function:myZip:2', /* required */
  // ClientContext: 'STRING_VALUE',
  InvocationType: 'RequestResponse',
  LogType: 'None',
  Payload: JSON.stringify({ "array" : [4, -5, 0, 9] }), // new Buffer('...') || 'STRING_VALUE',
  // Qualifier: 'STRING_VALUE'
};
lambda.invoke(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
  process.exit(0);
});