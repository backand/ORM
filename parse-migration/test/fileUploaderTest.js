/**
 * Created by backand on 2/15/16.
 */

var uploader = require('../fileUploader');
var request = require('request');
var expect = require("chai").expect;

describe('can upload file', function () {
    //text/plain
    //(fileName, fileData, fileType, appName)
    it('upload simple work', function (done) {
        this.timeout(8000);
        var data = 'asd';
        uploader.uploadFile('a.txt', data, 'text/plain', 'angular2').then(function (res) {
            console.log(res);
            var link = res.link;
            request(res.link, function (err, response, rData) {
                expect(rData).to.be.equal(data);
                done();
            });
        });
    });

    // check that undefined change to empty string
    it('upload undefined file', function (done) {
        this.timeout(8000);
        var data = undefined;
        uploader.uploadFile('b.txt', data, 'text/plain', 'angular2').then(function (res) {
            console.log(res);
            var link = res.link;
            request(res.link, function (err, response, rData) {
                expect(rData).to.be.equal('');
                done();
            });
        });
    });

    it('upload empty file', function (done) {
        this.timeout(8000);
        var data = '';
        uploader.uploadFile('c.txt', data, 'text/plain', 'angular2').then(function (res) {
            console.log(res);
            var link = res.link;
            request(res.link, function (err, response, rData) {
                expect(rData).to.be.equal(data);
                done();
            });
        });
    });
})
