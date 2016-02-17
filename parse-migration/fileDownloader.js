/**
 * Created by backand on 2/8/16.
 */

var _ = require('lodash');
var request = require('request');
var fs = require('fs');
var q = require('q');
var logger = require('./logging/logger').getLogger('FileUtil');
var Zip = require("adm-zip");
var mkdirp = require('mkdirp');
var Utils = require("adm-zip/util");
var pth = require("path");

String.prototype.replaceAll = function(search, replacement) {
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

function unzipFile(fileName, directory) {
    logger.info('start unzip for ' + fileName);
    var deferred = q.defer();
    var zip = new Zip(fileName);
    var path = this.path + '/' + directory;
    mkdirp(path, function (err) {
        if (err) {
            deferred.reject(err);
            return;
        }

        try {

            zip.getEntries().forEach(function(entry) {
                var entryName = entry.entryName.toString().replaceAll(":","_");
                var targetPath = pth.resolve(path, entryName);
                if (entry.isDirectory) {
                    Utils.makeDir(pth.resolve(targetPath,entryName));
                    return;
                }
                var content = entry.getData();
                if (!content) {
                    throw Utils.Errors.CANT_EXTRACT_FILE + "2";
                }
                Utils.writeFileTo(targetPath, content, true);
            })
           // zip.extractAllTo(path, true);
            logger.info('finish unzip for ' + path);
            deferred.resolve(path);
        } catch (err2) {
            deferred.reject(err2);
        }

    });
    return deferred.promise;
}

function getFilesList(directory){
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

module.exports = FileDownloader;
