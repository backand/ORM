var s3 = require('s3');
var fs = require('fs');
var _ = require('lodash');
var redis = require('redis');
var config = require('../config');
redisClient = redis.createClient(config.redis);

var credentials = JSON.parse(fs.readFileSync('../hosting/kornatzky-credentials.json', 'utf8'));

var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    region: "us-east-1"
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});


/**
 * lists a folder within bucket of AWS S3
 * @param  {string}   bucket       
 * @param  {string}   folder      appName
 * @param  {string}   pathInFolder path to folder under appName
 * @param  {Function} callback     function(err, data) data is an array with two types of values { Key: 'subfolder' } 
 * or { Key: 'k2/assets/x.txt',
    LastModified: Fri Jan 15 2016 17:05:10 GMT+0200 (IST),
    ETag: '"6de9439834c9147569741d3c9c9fc010"',
    Size: 4,
    StorageClass: 'STANDARD',
    Owner: 
     { DisplayName: 'yariv-backand',
       ID: 'cedd39045561647da87994789e8886ef86a95514ea501013cdb4f8b496f9be2f' } } 
 */
function listFolder(bucket, folder, pathInFolder, callback){
	var rawData = [];
	var prefix = folder + "/" + pathInFolder;
	var params = { 
		s3Params: {
			  Bucket: bucket, /* required */
			//  Delimiter: 'dir1',
			  EncodingType: 'url',
			  // Marker: 'STRING_VALUE',
			  MaxKeys: 10000000,
			  Prefix: prefix
		}, 
		recursive: true 
	};
	var emitter = client.listObjects(params)
	.on('end', function(){
		// console.log('end');
		// console.log(emitter.objectsFound);
		// console.log(emitter.dirsFound);
		callback(null, rawData);
	})
	.on('error', function(err){
		// console.log('error');
		// console.log(err);
		callback(err, rawData);
	})
	.on('data', function(data){
		var prefixLength = prefix.length + 1;		
		_.each(data.Contents, function(file){
			if (file.Key.lastIndexOf("/") <= prefixLength){ // files in folder
				rawData.push(file);
			}
			else { // folders in folder
				var indexOfFolder = file.Key.indexOf("/", prefixLength);
				var folderName = file.Key.substr(0, indexOfFolder);
				if (rawData.length == 0) 
					rawData.push({ Key: folderName });
				var lastElement = _.last(rawData);
				if (lastElement.Key != folderName){
					rawData.push({ Key: folderName });
				}
			}
		});
	})
	.on('progress', function(){
		// console.log('progress', emitter.objectsFound, emitter.dirsFound, emitter.progressAmount);
	});
}

function storeFolder(bucket, folder, callback){
	var prefix = folder;
	var params = { 
		s3Params: {
			  Bucket: bucket, /* required */
			//  Delimiter: 'dir1',
			  EncodingType: 'url',
			  // Marker: 'STRING_VALUE',
			  MaxKeys: 10000000,
			  Prefix: prefix
		}, 
		recursive: true
	};
	var emitter = client.listObjects(params)
	.on('end', function(){
		// console.log('end');
		// console.log(emitter.objectsFound);
		// console.log(emitter.dirsFound);
		callback(null);
	})
	.on('error', function(err){
		// console.log('error');
		// console.log(err);
		callback(err);
	})
	.on('data', function(data){
		redisClient.set(bucket + "/" + folder, JSON.stringify(data.Contents));
		redisClient.expire(bucket + "/" + folder, 3600);
		// var prefixLength = prefix.length + 1;
		// var a = _.map(data.Contents, function(file){
		// 	return { file: file, index: file.Key.lastIndexOf("/") }
		// });
		
		// _.each(data.Contents, function(file){
		// 	if (file.Key.lastIndexOf("/") <= prefixLength){ // files in folder
		// 		rawData.push(file);
		// 	}
		// 	else { // folders in folder
		// 		var indexOfFolder = file.Key.indexOf("/", prefixLength);
		// 		var folderName = file.Key.substr(0, indexOfFolder);
		// 		if (rawData.length == 0) 
		// 			rawData.push({ Key: folderName });
		// 		var lastElement = _.last(rawData);
		// 		if (lastElement.Key != folderName){
		// 			rawData.push({ Key: folderName });
		// 		}
		// 	}
		// });
	})
	.on('progress', function(){
		// console.log('progress', emitter.objectsFound, emitter.dirsFound, emitter.progressAmount);
	});
}

function filterFiles(bucket, folder, pathInFolder, callback){
	redisClient.get(bucket + "/" + folder, function(err, reply){
		if (err){
			callback(err);
		}
		else if (reply){ // we visited this path before
			var data = JSON.parse(reply);
			var prefix = folder + "/" + pathInFolder;
			var prefixLength = prefix.length + 1;
			var rawData = [];
			_.each(data, function(file){
				if (file.Key.lastIndexOf("/") <= prefixLength){ // files in folder
					rawData.push(file);
				}
				else { // folders in folder
					var indexOfFolder = file.Key.indexOf("/", prefixLength);
					var folderName = file.Key.substr(0, indexOfFolder);
					if (rawData.length == 0) 
						rawData.push({ Key: folderName });
					var lastElement = _.last(rawData);
					if (lastElement.Key != folderName){
						rawData.push({ Key: folderName });
					}
				}
			});
			callback(null, rawData);
		}
		else{
			callback("not stored")
		}
		
	});
}


module.exports.listFolder = listFolder;
module.exports.storeFolder = storeFolder;
module.exports.filterFiles = filterFiles;

// listFolder('backandhosting', 'k2', 'assets', function(err, data){
// 	console.log("--------");
// 	console.log(err);
// 	console.log(data);
// 	process.exit(0);
// });

// storeFolder('backandhosting', 'kffff2', function(err, data){
// 	console.log("--------");
// 	console.log(err);
// 	console.log(data);
// 	process.exit(0);
// });

// filterFiles('backandhosting', 'k2', 'assets', function(err, data){
// 	console.log("--------");
// 	console.log(err);
// 	console.log(data);
// 	process.exit(0);
// });