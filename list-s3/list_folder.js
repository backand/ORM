var s3 = require('s3');
var fs = require('fs');

var credentials = JSON.parse(fs.readFileSync('../hosting/kornatzky-credentials.json', 'utf8'));

var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    region: "us-east-1"
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});

var params = { 
	s3Params: {
		  Bucket: 'backandhosting', /* required */
		//  Delimiter: 'dir1',
		  EncodingType: 'url',
		  // Marker: 'STRING_VALUE',
		  MaxKeys: 10000000,
		  Prefix: 'k2'
	}, 
	recursive: true 
};
var emitter = client.listObjects(params);
emitter
.on('end', function(){
	console.log('end');
	console.log(emitter.objectsFound);
	console.log(emitter.dirsFound);
	process.exit(1);
})
.on('error', function(err){
	console.log('error');
	console.log(err);
	process.exit(1);
})
.on('data', function(data){
	console.log('data', data);
})
.on('progress', function(){
	console.log('progress', emitter.objectsFound, emitter.dirsFound, emitter.progressAmount);
})
;