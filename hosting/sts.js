module.exports.getTemporaryCredentials = getTemporaryCredentials;

var AWS = require('aws-sdk');
var uuid = require('uuid');
var jsonfile = require('jsonfile')
 
var credentialsFile = 'aws-credentials.json';
var iamRole = 'arn:aws:iam::328923390206:role/hosting';

function getTemporaryCredentials(bucket, dir, callback){

	// get iam credentials
	AWS.config.loadFromPath(credentialsFile);
	AWS.config.update({ logger: process.stdout });
    var params = {
	  RoleArn: iamRole,
      RoleSessionName: uuid.v4().slice(31), /* required */
	  DurationSeconds: 3600,
	  Policy: 
	  	JSON.stringify({
		  "Version": "2012-10-17",
		  "Statement": [
		  	{
		       "Effect": "Allow",
		       "Action": "s3:ListBucket",
		       "Resource": "arn:aws:s3:::" + bucket,
		       "Condition":{"StringEquals":{"s3:prefix":["", dir + "/"  ],"s3:delimiter":["/"]}}
		    },		  	
		    {
		       "Effect": "Allow",
		       "Action": "s3:ListBucket",
		       "Resource": "arn:aws:s3:::" + bucket,
		       "Condition":{"StringLike":{"s3:prefix":["", dir + "/*"],"s3:delimiter":["/"]}}
		    },
		    {
		       "Effect": "Allow",
		       "Action": "s3:ListObjects",
		       "Resource": "arn:aws:s3:::" + bucket,
		       "Condition":{"StringEquals":{"s3:prefix":["", dir],"s3:delimiter":["/"]}}
		    },
		    {
		       "Effect": "Allow",
		       "Action": "s3:ListObjects",
		       "Resource": "arn:aws:s3:::" + bucket,
		       "Condition":{"StringEquals":{"s3:prefix":[""]}}
		    },
		    {
		       "Effect": "Allow",
		       "Action": "s3:ListObjects",
		       "Resource": "arn:aws:s3:::" + bucket,
		       "Condition":{"StringLike":{"s3:prefix":["",dir + "/*"],"s3:delimiter":["/"]}}
		    },
		    {
		      "Effect": "Allow",
		      "Action": [
		        "s3:GetObject*",
		        "s3:PutObject*",
		        "s3:DeleteObject*",
		        "s3:PutObjectAcl*"
		      ],
		      "Resource": "arn:aws:s3:::" + bucket + "/" + dir + "/*"
		    }
		  ]
		})
	  // SerialNumber: 'STRING_VALUE',
	  // TokenCode: 'STRING_VALUE'
	};
	var sts = new AWS.STS();
	sts.assumeRole(params, function (err, data) {
	  callback(err, data);
	});
	var params = {
	  DurationSeconds: 900,
	  // SerialNumber: 'STRING_VALUE',
	  // TokenCode: 'STRING_VALUE'
	};
}

// test of sts
// should be commented out before using with schema server
//getTemporaryCredentials("hosting.backand.net", "app3", function(err, data){
//  var temporaryCredentialsFile = 'temporary-credentials.json';
//
//  if (err){
//		process.exit(1);
//	}
//	else {
//		var temporaryCredentials = {
//			accessKeyId: data.Credentials.AccessKeyId,
//			secretAccessKey: data.Credentials.SecretAccessKey,
//			sessionToken: data.Credentials.SessionToken
//		};
//		console.log(temporaryCredentials);
//		jsonfile.writeFile(temporaryCredentialsFile, temporaryCredentials, {spaces: 2}, function(err) {
//		  if (err){
//		  	process.exit(2);
//		  }
//		  else{
//		  	process.exit(0);
//		  }
//		});
//
//	}
//});