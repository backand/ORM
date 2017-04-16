var AWS = require('aws-sdk');
var https = require('https');
AWS.config.loadFromPath('../hosting/aws-credentials.json');
AWS.config.update({ 'region': 'us-east-1' });
var s3 = new AWS.S3();

function downloadUrlIntoS3(sourceUrl, sourceBytesSize, bucket, folder, fileName, callback){
    https.get(sourceUrl, function(stream) {
        
        var params = {
            Bucket: bucket,
            Key: folder + "/" + fileName,
            ACL: 'private',
            Body: stream,
            // CacheControl: 'STRING_VALUE',
            // ContentDisposition: 'STRING_VALUE',
            // ContentEncoding: 'STRING_VALUE',
            // ContentLanguage: 'STRING_VALUE',
            ContentLength: sourceBytesSize,
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

// downloadUrlIntoS3('https://prod-04-2014-tasks.s3.amazonaws.com/snapshots/328923390206/testlambda_items_jhjk-ef6632d2-e4bc-469a-b682-605aff5fe675?X-Amz-Security-Token=FQoDYXdzEP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDA9G3z9p2mCvgpJ%2BiCK3A4up1LsJkN7FSua0AZzIGBLuKWInCAWUkiQ5s87%2BNm5yNNmPn1vdRG2FzMlsWVMJcupWzodjyOwVrJKAaf4jcCx8XKdKE75wdk10xDuTmXI4DrwNELtJEl7Wtff89wXnalCuJZhzBldiL%2BEuiYFwZKz4gVozcav0dbrlWXpO6A8RGUG6E98pAsyOA97KE9h%2FnyORk0g4sFQXECosBXnajcniuJPoheqJO2NeIWT%2BM7DIqQCVUVgt9AIauuxV46ZNcxS6o3%2BI%2FyHni2THF3qgItvTbcxzqBEHy8aKtLzOyxwetSF4b5NL%2BRXahBBvJNIqug%2Bz7317F8pT0QzGV6r3k1W6jiTlR70BGmrVjU6L1cM9bjXsqrD2JsIKXUwgSiqMAY42PUNrPvhRI0UXryoRlFAo5Yha1BWMyoLGIg%2BFx%2BdrKdppJKrHyMJWsxAjzi13F2LNFrOhP8GPBVPZ2TTiq8V9LlYs%2BGP%2BZfntaOukxi8s45Rc4nIdnBXMlrziO35qpF2ujiiLgMAaIYFxLcVmIb9tQmyV0RI2ggQ3HPBeTyEa9CjO6kqOW%2BTU9%2BMQ5SE%2FEjQtGtFHv2Qot5HMxwU%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20170416T071342Z&X-Amz-SignedHeaders=host&X-Amz-Expires=600&X-Amz-Credential=ASIAISHAZKRRJDWJGHFA%2F20170416%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8ced8fe7a3364a14fd5644a6696faa533c99b97495237da22a26d8905ccb3e56', 
// 	1434, 'backandhosting', 'first', 'k.zip', function(err, data){
// 	console.log(err);
// 	console.log(data);
// 	process.exit(1);
// });