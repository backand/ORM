var AWS = require('aws-sdk');
var mime = require('mime-types');
var config = require('../configFactory').getConfig();
var url = require('url');

function uploadFile(credentials, fileName, fileType, file, bucket, dir, callback) {

	try{
		var useBackandAccount = false;
		if(!credentials){
			credentials = config.AWSDefaultConfig.credentials;
			useBackandAccount = true;
		}

		var s3 = new AWS.S3({credentials: credentials});

		var contentType = fileType;

		if (!contentType) {
				contentType = getContentType(fileName);
		}

		var buffer = new Buffer(file, 'base64');
		var key = (dir) ? dir + "/" + fileName : fileName;
		var params = {
				Bucket: bucket,
				Key: key,
				ACL: 'public-read',
				Body: buffer,
				// CacheControl: 'STRING_VALUE',
				// ContentDisposition: 'STRING_VALUE',
				// ContentEncoding: 'STRING_VALUE',
				// ContentLanguage: 'STRING_VALUE',
				// ContentLength: 0,
				// ContentMD5: 'STRING_VALUE',
				ContentType: contentType,
				Expires: new Date// || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
				// GrantFullControl: 'STRING_VALUE',
				// GrantRead: 'STRING_VALUE',
				// GrantReadACP: 'STRING_VALUE',
				// GrantWriteACP: 'STRING_VALUE',
				// Metadata: {
				//   someKey: 'STRING_VALUE',
				//   /* anotherKey: ... */
				// },
				// RequestPayer: 'requester',
				// SSECustomerAlgorithm: 'STRING_VALUE',
				// SSECustomerKey: new Buffer('...') || 'STRING_VALUE',
				// SSECustomerKeyMD5: 'STRING_VALUE',
				// SSEKMSKeyId: 'STRING_VALUE',
				// ServerSideEncryption: 'AES256 | aws:kms',
				// StorageClass: 'STANDARD | REDUCED_REDUNDANCY | STANDARD_IA',
				// WebsiteRedirectLocation: 'STRING_VALUE'
		};

		s3.putObject(params, function (err, data) {
				if (err) {
					callback(err)
				}
				else {
					//var link = "https://s3.amazonaws.com/" + bucket + "/" + dir + "/" + fileName;
					var link = "";
					if(useBackandAccount){
						link = `${config.storageConfig.serverProtocol}://${bucket}/${key}`;
						callback(null, {link: link, data:data});
					} else {
						//s3Client.getResourceUrl("your-bucket", "some-path/some-key.jpg");
						var params = {
							Bucket: bucket
						};
						s3.getBucketLocation(params, function (err, data) {
							if (err) {
								callback(err);
							}
							else {
								var bucketLocation = (data.LocationConstraint) ? data.LocationConstraint : null;
								var nonStandardBucketLocation = (bucketLocation && bucketLocation !== 'us-east-1');
								var hostnamePrefix = nonStandardBucketLocation ? ('s3-' + bucketLocation) : 's3';
								var parts = {
									protocol: 'https:',
									hostname: hostnamePrefix + '.amazonaws.com',
									pathname: '/' + bucket + '/' + encodeSpecialCharacters(key)
								}
								link = url.format(parts);
								callback(null, {link: link, data:{}});
							}
						})
					}
				}
		});
	}
	catch(err){
		callback(err);
	}
}
function encodeSpecialCharacters (str) {
  return encodeURI(str).replace(/[!'()* ]/g, function (char) {
    return '%' + char.charCodeAt(0).toString(16)
  })
}

function getContentType(fileName){
  var cType = mime.lookup(fileName);
  if(!cType){
      cType = "text/plain";
  }
  return cType;
}

function deleteFile(credentials, bucket, dir, fileName, callback) {

  if(!credentials){
		credentials = config.AWSDefaultConfig.credentials;
	}
  var s3 = new AWS.S3({credentials: credentials});
	var key = (dir) ? dir + "/" + fileName : fileName;
  var params = {
      Bucket: bucket, /* required */
      Key: key/* required */
  };
	
  s3.deleteObject(params, function (err, data) {
      if (err) {
          callback(err)
      }
      else {
        callback(null, data);
      }
  });
}

module.exports.uploadFile = uploadFile;
module.exports.deleteFile = deleteFile;