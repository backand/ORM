/**
 * Created by backand on 2/8/16.
 */

var request = require('request');
var fs = require('fs');
var q = require('q');
var logger = require('./logging/logger').getLogger('FileUtil');
var Zip = require("adm-zip");
var mkdirp = require('mkdirp');


function downloadFile(url, fileName) {
    logger.info('start download file ' + url + ' fileName ' + fileName);
    var self = this;
    var deferred = q.defer();
    var fn = fileName;
    var path = this.path + '/' + fileName + '.zip';
    var stream = request(url).pipe(fs.createWriteStream(path));
    stream.on('finish', function () {
        logger.info('finish download file ' + fn);
        deferred.resolve(path);
    });
    stream.on('error', function (err) {
        logger.error('cant download file ' + fn + err);
        deferred.reject(err);
    });

    return deferred.promise;
}

function unzipFile(fileName) {
    logger.info('start unzip for ' + fileName);
    var deferred = q.defer();
    var directory = fileName.substr(0, fileName.indexOf('.'));
    var zip = new Zip(fileName);
    mkdirp(directory, function (err) {
        if (err) {
            deferred.reject(err);
            return;
        }

        try {
            zip.extractAllTo(directory, true);
            logger.info('finish unzip for ' + directory);
            deferred.resolve(directory);
        } catch (err2) {
            deferred.reject(err2);
        }

    });

    return deferred.promise;
}


var FileDownloader = function (path) {
    this.path = path;
}

FileDownloader.prototype.downloadFile = downloadFile;

FileDownloader.prototype.unzipFile = unzipFile;

module.exports = FileDownloader;
