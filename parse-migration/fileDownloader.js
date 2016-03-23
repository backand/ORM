/**
 * Created by backand on 2/8/16.
 */

var _ = require('lodash');
var request = require('request');
var fs = require('fs');
var q = require('q');
var logger = require('./logging/logger').getLogger('FileUtil');
//var Zip = require("adm-zip");
var mkdirp = require('mkdirp');
//var Utils = require("adm-zip/util");
var pth = require("path");
var Zip = require('node-7z'); // Name the class as you want!


String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function downloadFile(url, fileName) {
    logger.info('start download file ' + url + ' \nfileName ' + fileName);
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

function getPath(fileName) {
    return q(this.path + '/' + fileName + '.zip');
}

function unzipFile(fileName, directory) {
    var deferred = q.defer();

    logger.info('start unzip for ' + fileName);

    var path = this.path + '/' + directory;
    mkdirp(path, function (err) {
        if (err) {
            deferred.reject(err);
            return;
        }

        var myTask = new Zip();
        myTask.extractFull(fileName, path)
            // When all is done
            .then(function () {
                console.log('Extracting done!');
                logger.info('finish unzip for ' + path);
                deferred.resolve(path);
            })
            // On error
            .catch(function (err) {
                deferred.reject(err);
            });
    });

    return deferred.promise;
}

function getFilesList(directory) {
    logger.info('Get list of files for folder ' + directory);

    //this assume flat folder
    return fs.readdirSync(directory);

}

var FileDownloader = function (path) {
    this.path = path;
};

FileDownloader.prototype.downloadFile = downloadFile;

FileDownloader.prototype.unzipFile = unzipFile;

FileDownloader.prototype.getFilesList = getFilesList;

FileDownloader.prototype.getPath = getPath;

module.exports = FileDownloader;
