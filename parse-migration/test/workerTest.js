/**
 * Created by backand on 2/4/16.
 */
var expect = require("chai").expect;
var _ = require('underscore');
var StatusBL = require('../statusBL');

describe('sample test', function () {
    it('ok', function (done) {
        done();
    })
})


describe('test can connect to backand', function () {
    it('connect to backand', function (done) {
        var u = new StatusBL();
        u.connect().then(done);
    })
})
