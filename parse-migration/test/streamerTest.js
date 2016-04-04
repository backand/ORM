/**
 * Created by backand on 2/4/16.
 */
var expect = require("chai").expect;
var _ = require('underscore');
var Streamer = require('../streamer');
var streamer = new Streamer();
var fs = require('fs');
var prefix = "test/streamerTestExample/";

describe('read file', function () {
    it('can read json file', function (done) {
        streamer.getData(prefix, 'valid.json', console.log, done);
    })

    //it('can read empty file', function (done) {
    //    done();
    //})
    //
    //it('can read non existing file', function(done){
    //
    //})
    //
    it('can read non valid json and don"t exit', function (done) {
        streamer.getData(prefix, 'nonValid.json', console.log, function () {
            done();
        });
    })
})





