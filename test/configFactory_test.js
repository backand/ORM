/**
 * Created by backand on 1/11/16.
 */
process.chdir(__dirname);
var path = process.env.TESTPATH || '../';

var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

var getConfig = require(path + '/configFactory').getConfig;
var _ = require('underscore');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");

chai.should();
chai.use(sinonChai);

describe("valid config", function () {
    this.timeout(300);
    it('can fetch qa', function (done) {
            var config = getConfig("qa");
            expect(config).not.to.be.undefined;
            expect(config.api_url).to.be.equal("http://api.backand.co");
            done();
        });

    it('default is dev', function (done) {
            var config = getConfig();
            expect(config).not.to.be.undefined;
            expect(config.api_url).to.be.equal("https://api.backand.com");
            done();
        });
});
