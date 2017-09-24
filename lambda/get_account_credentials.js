/**
 * Created by Yariv on 7/17/2017.
 */
var AWS = require('aws-sdk');
var role_name_from_user = "BackandCrossAccountRole"; // this is the role the user creats in his own account

AWS.config.loadFromPath('./hosting/aws-credentials.json');


var sts = new AWS.STS();

function getAccountCredentials(awsRegion, accessKeyId, secretAccessKey, callback) {
    //target account ID :820250387915
    //assume role : BackandCrossAccountRole
    AWS.config.loadFromPath('./hosting/aws-credentials.json');
    var sts = new AWS.STS();
    if ( secretAccessKey && secretAccessKey != null && secretAccessKey.indexOf('bknd_') != 0) {
        callback(null, {
            awsRegion: awsRegion,
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
        });
    }
    else {
        var role_arn = "arn:aws:iam::" + accessKeyId + ":role/"
        role_arn += role_name_from_user;

        var params = {
            RoleArn: role_arn,
            ExternalId: secretAccessKey,
            RoleSessionName: "AssumeRoleSession"
        }
        sts.assumeRole(params, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                callback(err);
            }
            else {
                //console.log("using cross account creds");
                callback(null, {
                    awsRegion: awsRegion,
                    accessKeyId: data.Credentials.AccessKeyId,
                    secretAccessKey: data.Credentials.SecretAccessKey,
                    sessionToken: data.Credentials.SessionToken
                });
            }

        });
    }




}
module.exports.getAccountCredentials = getAccountCredentials;


// getAccountCredentials("us-east-1", "820250387915", "bknd_d613b4aa-ac23-4287-9e0e-acbcb030d4c6", function (err, p) {
//     if (err)
//         console.log(err);
//     else
//         console.log(p);
// });