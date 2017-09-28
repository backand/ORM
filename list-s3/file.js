var AWS = require('aws-sdk');
var mime = require('mime-types');
var config = require('../configFactory').getConfig();

function uploadFile(credentials, fileName, fileType, file, bucket, dir, callback) {

	
	if(!credentials){
		credentials = config.AWSDefaultConfig.credentials;
	}

	var s3 = new AWS.S3({credentials: credentials});

  var contentType = fileType;

  if (!contentType) {
      contentType = getContentType(fileName);
  }

  var buffer = new Buffer(file, 'base64');
  var params = {
      Bucket: bucket,
      Key: dir + "/" + fileName,
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
        var link = `${config.storageConfig.serverProtocol}://${bucket}/${dir}/${fileName}`;
        callback(null, {link: link, data:data});
      }
  });
}

function getContentType(fileName){
  var cType = mime.lookup(fileName);
  if(!cType){
      cType = "text/plain";
  }
  return cType;
}

function deleteFile(bucket, dir, fileName, callback) {

  
  var s3 = new AWS.S3({credentials:config.AWSDefaultConfig.credentials});

  var params = {
      Bucket: bucket, /* required */
      Key: dir + "/" + fileName/* required */
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