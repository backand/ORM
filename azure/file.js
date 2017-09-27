'use strict';
var azure = require('azure-storage');
var stream = require('stream');
var mime = require('mime-types');

function uploadFile(conectionString, fileName, fileType, file, bucket, dir, callback) {

    try{

        var fullName = fileName;
        if(dir && dir != ''){
            fullName = dir + "/" + fileName;
        }
        
        var blobService = azure.createBlobService(conectionString);

        blobService.createContainerIfNotExists(bucket, {
        publicAccessLevel: 'blob'
        }, function(error, result, response) {
            if (!error) {
                // if result = true, container was created.
                // if result = false, container already existed.
                var options = {
                    contentType: getContentType(fileName),
                    contentEncoding: 'base64'
                };

                blobService.createBlockBlobFromText(bucket, fullName, file, options, function(error, result, response) {
                    if (!error) {
                        // blob retrieved
                        //var link = config.storageConfig.serverProtocol + '://' + bucket + "/" + dir + "/" + fileName;
                        link = 'https://backandstoragetest.blob.core.windows.net/testupload/clock.mp3';
                        callback(null, {link: link, data:data});
                    }
                });
            }
        });
        
    } catch(err){
        callback(err);
    }
}

function getContentType(fileName){

    var s = fileName.toLowerCase();
    var ext = '';
    var extPosition = s.lastIndexOf('.');
    if (extPosition > -1) {
        ext = s.substr(extPosition + 1);
    }
    else {
        ext = '';
    }
    var contentType = fileType;

    if (!contentType) {
        contentType = getContentType(fileName);
        contentType = mime.lookup(fileName);
        if(!contentType){
            contentType = "text/plain";
        }
    }
  
    return contentType;
}

function deleteFile(bucket, dir, fileName, callback) {

  AWS.config.loadFromPath('./hosting/aws-credentials.json');
  var s3 = new AWS.S3();

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

//test data
var cs = 'DefaultEndpointsProtocol=https;AccountName=backandstoragetest;AccountKey=svyIYkPAq7wMVvJSyoIbnT3vNNeG5wEVDzYjU6zXprZg1bNjBZ3CIQL4441giiYu02nApvq2GeZ+ADligaBhiA==;EndpointSuffix=core.windows.net';
var data = {
    file: "V2UgbG92ZSB5b3JhbQ==",
    fileName: "clock.mp3",
    bucket: "testupload",
    dir: ""
};
uploadFile(cs, data.fileName, "", data.file, data.bucket, data.dir, function(err, data){
  if(err){
    console.log(err);
  } else {
    console.log(data);
  }
  process.exit(1);
})