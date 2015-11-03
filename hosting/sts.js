module.exports.getTemporaryCredentials = getTemporaryCredentials;

var AWS = require('aws-sdk');
var uuid = require('uuid');

function getTemporaryCredentials(bucket, callback){
	// get credentials
	// var credentials = JSON.parse(fs.readFileSync('aws-credentials.json', 'utf8'));

	// AWS.config.loadFromPath('aws-credentials.json');
	AWS.config.loadFromPath('kornatzky-credentials.json');
	AWS.config.update({ logger: process.stdout });
  //'arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforDataPipelineRole', // 'arn:aws:s3:::backandhosting', // 'arn:aws:iam::aws:policy/AmazonS3FullAccess', //  'arn:aws:iam::328923390206:policy/stsAllowAssumeRole', //'arn:aws:iam::328923390206:policy/full-s3-kornatzky', //'arn:aws:iam::328923390206:role/gulpmanager', //'arn:aws:iam::aws:policy/AmazonS3FullAccess', //'arn:aws:s3:::backandhosting', /* required */
  var params = {
	  RoleArn: 'arn:aws:iam::328923390206:role/hosting',
    RoleSessionName: uuid.v4().slice(31), /* required */
	  DurationSeconds: 3600,
	  // ExternalId: 'STRING_VALUE',
	  Policy: // 'STRING_VALUE',
	  	JSON.stringify({
		  "Version": "2012-10-17",
		  "Statement": [
		     {
		       "Effect": "Allow",
		       "Action": "s3:ListBucket",
		       "Resource": "arn:aws:s3:::backandhosting"
		     },
		    {
		      "Effect": "Allow",
		      "Action": [
		        "s3:GetObject*",
		        "s3:PutObject*",
		        "s3:DeleteObject"
		      ],
		      "Resource": "arn:aws:s3:::backandhosting/*"
		    }
		  ]
		})
	  // SerialNumber: 'STRING_VALUE',
	  // TokenCode: 'STRING_VALUE'
	};
	// var s3 = new AWS.S3();
	var sts = new AWS.STS();
	sts.assumeRole(params, function (err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log(data);           // successful response
	  callback(err, data);
	});
	var params = {
	  DurationSeconds: 900,
	  // SerialNumber: 'STRING_VALUE',
	  // TokenCode: 'STRING_VALUE'
	};
	// sts.getSessionToken(params, function(err, data) {
	//   if (err) console.log(err, err.stack); // an error occurred
	//   else     console.log(data);           // successful response
	//   process.exit(1);
	// });
}

getTemporaryCredentials("backandhosting", function(err, data){
	process.exit(1);
});