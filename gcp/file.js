'use strict';
const google = require('googleapis');
const request = require('request');
var mime = require('mime-types');

function uploadFile(privateKey, clientEmail, fileName, fileType, file, bucket, dir, callback) {

    try{

        var fullName = fileName;
        if(dir && dir != ''){
            fullName = dir + "/" + fileName;
        }
        
        const jwtClient = new google.auth
            .JWT(clientEmail, null, privateKey, ['https://www.googleapis.com/auth/cloud-platform'], null);

        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.log(err);
                callback(err);
            }

            var type = getContentType(fileName, fileType);
            var buffer = new Buffer(file, 'base64');
            var eUrl = encodeURI(`https://www.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${fullName}`);
            const options = {
                url: eUrl,
                method: "POST",
                body: buffer,
                headers: {
                    'Authorization': `${tokens.token_type} ${tokens.access_token}`,
                    'Content-Type': type,
                    'Content-Length': buffer.length,
                }
            };

            request(options, (err, response, body) => {
                if (err) return callback(err);
                if (response.statusCode !== 200) return callback(body || response.statusMessage);

                var link = `https://storage.cloud.google.com/${bucket}/${fullName}`; //https://storage.cloud.google.com/backandtestupload/dir1/clock.mp3;
                callback(null, {link: link, data: response});  
            });
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

function deleteFile(privateKey, clientEmail, bucket, dir, fileName, callback) {
    
    try{

        var fullName = fileName;
        if(dir && dir != ''){
            fullName = dir + "/" + fileName;
            fullName = fullName.replace(/\//g, "%2F");
        }
        
        const jwtClient = new google.auth
            .JWT(clientEmail, null, privateKey, ['https://www.googleapis.com/auth/cloud-platform'], null);

        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.log(err);
                callback(err);
            }
            
            const options = {
                url: `https://www.googleapis.com/storage/v1/b/${bucket}/o/${fullName}`,
                method: "DELETE",
                headers: {
                    'Authorization': `${tokens.token_type} ${tokens.access_token}`
                }
            };

            request(options, (err, response, body) => {
                if (err) return callback(err);
                if (response.statusCode !== 200 && response.statusCode !== 204) return callback(body || response.statusMessage);

                callback(null, {});  
            });
        });
        
    } catch(err){
        callback(err);
    }
    
}

module.exports.uploadFile = uploadFile;
module.exports.deleteFile = deleteFile;

//test data
var config = {
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCaF2C1t3/G2TDH\nOJW1dELmMbLHpyVZRoc0ExIH/nduiREjNepZFZlf/MHDtyIGwC8JZ+7xMRCILAJV\nT8y3mxQN60hGf9Jhxh8FbPFN3550MDUtpeZ/KD46j9Uuagrkf7k9/f0oZY16QLAi\nJAOEZMSr0OnUTFAfoxHe7ME16MB0S/U/7vRUQlgoe8iXBddcLhiTJiL3+2iwyNXL\nzp5TOEePJvBw1G3LjOQax5YesRNj1nybj42ZDKo+NNv5CmK0ZELhYs4176frLjoi\nhhA4rkVQlWIcTjhQLoXeSEaqRaUGFLaFybXXj1eVwIF5xKlsRo/xyj9QuIYsJU5V\ns99YzS/XAgMBAAECggEACy6vIgDTEQcp9wswMh7hy/rHUp3apAPuQ+UuZc4dtLPV\nvoxnGVfr7X9WQHHF0l+YCkK0oGRDIt6uvKox3REv/2KXuCYGinnqPmaNjG0x/pSR\nB2MGuyuceHt/qQKhD7wFIW6RNKFKBxkyrweWCcGWVDGxBmsTVXhsD5V24AaoEMhl\ni1Y7Z0t6BN0icH30k60qm3t8bbJ6Y4O309V/gTwlJu/lPqzZ1pSPWtZ+eBpx23z9\nsH1NKkeEnx+q/jG1TUNUp4Eys65U6r5jD/HxLa0304l65SkwUXdq/8pRnKB7vbeX\ndUODszfn8fRHZ/ofvIZhOLxiktGJ/1cphZdmIKt/gQKBgQDJk3MbWxCaGI2ijQ2C\n0lMwKo+alfDHSmDbZFoZlfftrX530bLzqh3Du+6n1j/M6SBSD8hTssnZ6FUxYE6+\nOYx31HJ3Ox+GPBXR6uyJr1k7ma74Z6+qOJkhpcPmyagSeLW2WdsM44NszGjS+Z73\nkdaNvd4TZalFoFNBXioXz2+fZwKBgQDDseDk8sudv3N2C6vWth1QlQs74qN+abzY\nMcW5jsOPU7bjD2iAMJd//8woRqu7t7SYfPnzFgW5zSNfyOyLWCT8NAZlyeH4SYIG\njr62kgfgjNhJe475LA1K22770QApy2pZQz2gMaVCvzYFQWkZ61U3bmZJrGYxNkf+\nEfitexFWEQKBgGVJrSZKzP3RZqIOZIKe8uQaDsyrmTBa5G55b3i5zbnlWs4UVepw\nScKH1XUKiEaLwgzaF1xPU3QmdWB5NzgIrNetrdLRp5aI7KHtfOv2a00yfSQe3bsX\n84JfzB9UpxqZAx3c6uAAFpL955JTkhhudLQGeueeRr9Qv2TyTw5l0n3zAoGAHp8j\n8M9pOyrtF0imP/fJSIW590n0iWBkU3QeW3XSdggEcy1DDeQMoNPXD2pXjw0k7kOI\nHRiSFsvZwDBBi2BkkS5W3fCkMmTWOs51Wz4oi2OeqIj0C1twTQlfKXo/y0pwPr19\n1CZQlMw02MeueYbQk9brnJWkfAjhZQlM32CFivECgYBkr2ZR8VYiJy6ZxonCxW/w\npg0S/369L5ET7gSFEox7uCJldTJUbwJOzLHXkW8mFj7liIAR4hM+rm1pPfut7YiJ\nLDb/jfUwaVtRkIF6WKp7QhRAeaMY+qKkBOvVd3ORI7znVS+D20wFkT3L1VpY1QwD\nlr64MfZN0aXOLxirdz6BFw==\n-----END PRIVATE KEY-----\n",
  "client_email": "139848664087-compute@developer.gserviceaccount.com"
};
var data = {
    file: "V2UgbG92ZSB5b3JhbQ==",
    fileName: "clock.mp3",
    bucket: "backandtestupload",
    dir: "dir33/sub33"
};
uploadFile(config.private_key, config.client_email, data.fileName, null, data.file, data.bucket, data.dir, function(err, response){
    if(err){
        console.log(err);
    } else {
        console.log(response);
        deleteFile(config.private_key, config.client_email, data.bucket, data.dir, data.fileName, function (err, response){
            if(err){
                console.log(err);
            } else {
                console.log(response);
            }
            process.exit(1);
        })
    }
    
})

// deleteFile(config.private_key, config.client_email, data.bucket, data.dir, data.fileName, function (err, data){
//     if(err){
//         console.log(err);
//     } else {
//         console.log(data);
//     }
//     process.exit(1);
// })