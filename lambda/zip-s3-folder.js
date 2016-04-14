var S3Zipper = require ('aws-s3-zipper');
var fs = require('fs');
var path = './hosting/aws-credentials.json';

function zipS3Folder(bucket, folder, zipFileName,  callback){

    var config = JSON.parse(fs.readFileSync(path, 'utf8'));
    config.region = 'us-east-1';
    config.bucket = bucket;

    var zipper = new S3Zipper(config);
    zipper.calculateFileName = function(f){
        console.log(f);
        var rootFolder = folder.split("/");
        var name = f.Key.split("/");
        for (var i = 0; i < rootFolder.length; i++){
            name.shift();
        }
        name = name.join("/");
        return name;
    }

    /// if no path is given to S3 zip file then it will be placed in the same folder
    zipper.zipToS3File (folder, null, zipFileName,function(err,result){
        var fileName = null;
        if(err)
            console.error(err);
        else{
            var lastFile = result.zippedFiles[result.zippedFiles.length-1];
            if(lastFile)
                console.log('last key ', lastFile.Key); // next time start from here
        }
        callback(err, result);
    });
}

module.exports.zipS3Folder = zipS3Folder;

// bucket = "nodejs.backand.net"
// folder = "testtrans01/items/L58"
// fileName = "L58.zip"
// functionName = "testtrans01_items_L58"
// handlerName = "handler";
// callFunctionName = "handler"
// path = '../hosting/aws-credentials.json'
//
//
// zipS3Folder(bucket, folder, fileName, console.log);