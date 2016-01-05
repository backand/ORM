var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var request = require('superagent');
var _ = require('underscore');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");

var getUserDetails = require('../../backand_to_object').getUserDetails;

chai.should();
chai.use(sinonChai);

describe("anonymous login", function () {
   this.timeout(30000);
   it('can get user detail after anonymous login', function (done) {
       getUserDetails('', 'f0a0f62f-65ea-457e-93e8-ea7d21c07abf', 'ionic1', function (err, details) {
            err.should.be.false;
            done();
        });
    });

    it('can get user detail after anonymous null login', function (done) {
        getUserDetails(null, 'f0a0f62f-65ea-457e-93e8-ea7d21c07abf', 'ionic1', function (err, details) {
            err.should.be.false;
            done();
        });
    });
});
