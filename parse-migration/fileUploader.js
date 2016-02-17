/**
 * Created by backand on 2/14/16.
 */

var request = require('request');
var q = require('q');
var globalConfig = require('./configFactory').getConfig();
var transformAddress = globalConfig.transformAddress;
var transformUrl = "http://" + transformAddress.host + ':' + transformAddress.port;
var logger = require('./logging/logger').getLogger('fileUploader');

var s3FilesBucket = "files.backand.io";

var uploadFile = function (fileName, fileData, fileType, appName) {
    var deferred = q.defer();
    var current = this;
    current.fileName = fileName;
    logger.info('start upload file ' + fileName)

    if(!fileData){
        fileData = '';
    }

    fileData =new Buffer(fileData).toString('base64');
    /*

     C# code:
     data.Add("fileName", fileName);
     data.Add("file", fileData);
     data.Add("bucket", S3FilesBucket);
     data.Add("dir", appName);
     if (!string.IsNullOrEmpty(fileType))
     {
     data.Add("fileType", fileType);
     }
     */
    var json = {
        'fileName': fileName,
        'file': fileData,
        'bucket': s3FilesBucket,
        'dir' : appName,
        'fileType': fileType
    }

    request(
        {
            method: 'POST',
            url: transformUrl + '/uploadFile',
            json: json
        },
        function (error, response, data) {

            if (error) {
                logger.error('error upload file ' + current.fileName + ' ' + JSON.stringify(error));

                deferred.reject(error);
                return;
            }

            // should have link url
            deferred.resolve(data);
            logger.info("file upload to " + data.link);
        }
    );

    return deferred.promise;
}

module.exports.uploadFile = uploadFile;
