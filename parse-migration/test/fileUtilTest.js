/**
 * Created by backand on 2/8/16.
 */

var FileDownloader = require('../fileDownloader');
var fileUtil = new FileDownloader("/Users/backand/Documents/temp");

var fileLink = "https://s3.amazonaws.com/export.parse.com/b0ba5cbd-d164-47bc-a635-9d467a6e539d_1454328377_export.zip?AWSAccessKeyId=AKIAIOZ4MOVEOQZ2326Q&Expires=1457006777&Signature=2GPxrIxx0LiSfpKJ4JzmoImvEzM%3D";
var appName = "appName";
var bigFile = "http://download.thinkbroadband.com/100MB.zip";

describe('small file manipulation suit', function () {
    this.timeout(600000);
    it('can download small file', function (done) {
        fileUtil.downloadFile(fileLink, appName).then((path) => {
            console.log(path);
            done()
        });
    })

    it('can unzip files', function(){
        var path = '/Users/backand/Documents/temp/appName.zip';
        fileUtil.unzipFile(path).then((p2) => {
            done();
        })
    })
})

describe('big file manipulation suit', function () {
    this.timeout(600000);
    it('can download big file', function (done) {
        fileUtil.downloadFile(bigFile, "bigFile").then(() => {
            done()
        });
    })
})
