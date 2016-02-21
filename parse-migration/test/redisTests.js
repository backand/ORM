/**
 * Created by backand on 2/8/16.
 */
/**
 * Created by backand on 2/4/16.
 */
var expect = require("chai").expect;
var _ = require('underscore');
var RedisBulk = require('../redisBulkStatus');

// from parse server code
function newObjectId() {
    var chars = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789');
    var objectId = '';
    for (var i = 0; i < 10; ++i) {
        objectId += chars[Math.floor(Math.random() * chars.length)];
    }
    return objectId;
}

describe('can send and get data from redis', () => {
    var redis = new RedisBulk();
    var appName = newObjectId();
    it('can send data', (done) => {
        redis.setStatus(appName, 'status,',  'filename', 'objectId')
            .then(() => {
                done();
            })
    })

    it('can get data', function(){
        redis.getStatus(appName).then(function(data){
            expect(data.fileName).to.be.equal('filename');
            expect(data.objectId).to.be.equal('objectId');
            done();


        })
    })
})