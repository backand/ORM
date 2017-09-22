var AWS = require('aws-sdk');

AWS.config.update({ 
    "accessKeyId": "YA49F229S2L67QGYJQTK",
    "secretAccessKey": "/dPtS9YHhAQP3xegDoKFem9aW1h8DFopORoVIarv",
    'region': 'us-east-1', 
    'force_path_style': true,
    'endpoint': 'http://127.0.0.1:9000'});

var s3 = new AWS.S3();

s3.putObject({'Bucket': 'test1', 'Key':'testKey', 'Body': 'Hello from Backand', 'content_type': 'text/plain'}
  , function (err, data) {
    if(err){
      console.log(err)
    } else {
      console.log(data)
    }
    
});