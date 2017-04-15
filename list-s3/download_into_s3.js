var AWS = require('aws-sdk');
AWS.config.loadFromPath('./hosting/aws-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var s3 = new AWS.S3();

function downloadUrlIntoS3(sourceUrl, bucket, folder, fileName, callback){
    http.get(url, function(stream) {
        
        var params = {
            Bucket: data.bucket,
            Key: data.folder + "/" + data.fileName,
            ACL: 'private',
            Body: stream,
            // CacheControl: 'STRING_VALUE',
            // ContentDisposition: 'STRING_VALUE',
            // ContentEncoding: 'STRING_VALUE',
            // ContentLanguage: 'STRING_VALUE',
            // ContentLength: 0,
            // ContentMD5: 'STRING_VALUE',
            ContentType: 'application/octet-stream',
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
            callback(err, data);
        });
    });
}

module.exports.downloadUrlIntoS3 = downloadUrlIntoS3;