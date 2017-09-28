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
                var type = getContentType(fileName, fileType);
                var buffer = new Buffer(file, 'base64');

                blobService.createBlockBlobFromText(bucket, fullName, buffer, {contentSettings: {contentType: type}}, function(error, result, response) {
                    if (error) {
                        callback(error);
                    } else {
                        var link = `${blobService.host.primaryHost}${bucket}/${fullName}`; //'https://backandstoragetest.blob.core.windows.net/testupload/clock.mp3';
                        callback(null, {link: link, data: response});                    
                    }
                });
            }
        });
        
    } catch(err){
        callback(err);
    }
}

function getContentType(fileName, fileType){

    var contentType = fileType;

    if (!contentType) {
        contentType = mime.lookup(fileName);
        if(!contentType){
            contentType = "text/plain";
        }
    }
  
    return contentType;
}

function deleteFile(conectionString, bucket, dir, fileName, callback) {
    
    var blobService = azure.createBlobService(conectionString);

    var fullName = fileName;
        if(dir && dir != ''){
            fullName = dir + "/" + fileName;
        }
    blobService.deleteBlob(bucket, fullName, function(error, response){
        if (error) {
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
// var cs = 'DefaultEndpointsProtocol=https;AccountName=backandstoragetest;AccountKey=svyIYkPAq7wMVvJSyoIbnT3vNNeG5wEVDzYjU6zXprZg1bNjBZ3CIQL4441giiYu02nApvq2GeZ+ADligaBhiA==;EndpointSuffix=core.windows.net';
// var data = {
//     file: "V2UgbG92ZSB5b3JhbQ==",
//     fileName: "clock.mp3",
//     bucket: "testupload",
//     dir: "dir1"
// };
// uploadFile(cs, data.fileName, null, data.file, data.bucket, data.dir, function(err, data){
//     if(err){
//         console.log(err);
//     } else {
//         console.log(data);
//     }
//     process.exit(1);
// })

// deleteFile(cs, data.bucket, data.dir, data.fileName, function (err, data){
//     if(err){
//         console.log(err);
//     } else {
//         console.log(data);
//     }
//     process.exit(1);
// })