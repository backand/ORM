/**
 * Created by Relly on 6/15/2017.
 */

const AWS = require('aws-sdk');

function rename(bucketName, oldPrefix, newPrefix, callback) {
    AWS.config.loadFromPath('../hosting/aws-credentials.json');
    AWS.config.update({'region': 'us-east-1'});

    const async = require('async');
    // const bucketName = 'foo';
    // const oldPrefix = 'abc/';
    // const newPrefix = 'xyz/';

    const s3 = new AWS.S3({
        params: {
            Bucket: bucketName
        },
        region: 'us-east-1'
    });


// 1) List all the objects in the source "directory"
    s3.listObjects({
        Prefix: oldPrefix
    }, function (err, data) {

        if (err) callback(err, null);
        if (data.Contents.length) {

            // Build up the paramters for the delete statement
            let paramsS3Delete = {
                Bucket: bucketName,
                Delete: {
                    Objects: []
                }
            };

            // Expand the array with all the keys that we have found in the ListObjects function call, so that we can remove all the keys at once after we have copied all the keys
            data.Contents.forEach(function (content) {
                paramsS3Delete.Delete.Objects.push({
                    Key: content.Key
                });
            });

            // 2) Copy all the source files to the destination
            async.each(data.Contents, function (file, cb) {
                var params = {
                    CopySource: bucketName + '/' + file.Key,
                    Key: file.Key.replace(oldPrefix, newPrefix)
                };
                s3.copyObject(params, function (copyErr, copyData) {

                    if (copyErr) {
                        console.log(err);
                    } else {
                        console.log('Copied: ', params.Key);
                    }
                    cb();
                });
            }, function (asyncError, asyncData) {
                // All the requests for the file copy have finished
                if (asyncError) {
                    console.log(asyncError);
                    callback(asyncError, null);
                } else {
                    console.log(asyncData);

                    // 3) Now remove the source files - that way we effectively moved all the content
                    s3.deleteObjects(paramsS3Delete, callback)

                }
            });
        }
    });
}

module.exports.rename = rename;
