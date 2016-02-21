/**
 * Created by backand on 2/4/16.
 */
var expect = require("chai").expect;
var _ = require('underscore');
var MockStatusBl = require('../statusBLMock');
var expect = require("chai").expect;
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


describe('can run worker flow', function () {
    this.timeout(120 * 1000);
    it('can mock statusBl and run normal run', function (done) {

        var job = {
            appName: 'parsetest2',
            parseUrl: 'https://s3.amazonaws.com/files.backand.io/parseconverter/e41158a4-03cd-476e-b998-9adc784bfabd_1454941883_export.zip',
            appToken: '1536ce7d-a170-4963-8f57-1e4fc86094c2:c97d0fc4-d18d-11e5-b112-0ed7053426cb',
            status: 0,
            parseSchema: schema,
            workerId: '',
            CreationDate: new Date(),
            FinishTime: null
        };

        var mockStatusBl = new MockStatusBl(job)
        var Worker = require('../workerInner').Worker;

        worker = new Worker(mockStatusBl);
        worker.run(function () {
            console.log(worker.job);

            done();
        });


    })
})


var schema = `{"results":[{"className":"_User","fields":{"ACL":{"type":"ACL"},"authData":{"type":"Object"},"avatar":{"type":"File"},"createdAt":{"type":"Date"},"days_active":{"type":"Number"},"email":{"type":"String"},"emailVerified":{"type":"Boolean"},"location":{"type":"GeoPoint"},"objectId":{"type":"String"},"password":{"type":"String"},"updatedAt":{"type":"Date"},"username":{"type":"String"}}},{"className":"_Role","fields":{"ACL":{"type":"ACL"},"createdAt":{"type":"Date"},"name":{"type":"String"},"objectId":{"type":"String"},"roles":{"type":"Relation","targetClass":"_Role"},"updatedAt":{"type":"Date"},"users":{"type":"Relation","targetClass":"_User"}}},{"className":"_Product","fields":{"ACL":{"type":"ACL"},"createdAt":{"type":"Date"},"download":{"type":"File"},"downloadName":{"type":"String"},"icon":{"type":"File"},"objectId":{"type":"String"},"order":{"type":"Number"},"productIdentifier":{"type":"String"},"subtitle":{"type":"String"},"title":{"type":"String"},"updatedAt":{"type":"Date"}}},{"className":"_Installation","fields":{"ACL":{"type":"ACL"},"GCMSenderId":{"type":"String"},"badge":{"type":"Number"},"channels":{"type":"Array"},"createdAt":{"type":"Date"},"deviceToken":{"type":"String"},"deviceType":{"type":"String"},"installationId":{"type":"String"},"localeIdentifier":{"type":"String"},"objectId":{"type":"String"},"pushType":{"type":"String"},"timeZone":{"type":"String"},"updatedAt":{"type":"Date"}}},{"className":"Section","fields":{"ACL":{"type":"ACL"},"createdAt":{"type":"Date"},"name":{"type":"String"},"objectId":{"type":"String"},"topics":{"type":"Array"},"updatedAt":{"type":"Date"}}},{"className":"Topic","fields":{"ACL":{"type":"ACL"},"createdAt":{"type":"Date"},"name":{"type":"String"},"objectId":{"type":"String"},"text":{"type":"String"},"updatedAt":{"type":"Date"},"user":{"type":"Pointer","targetClass":"_User"}}},{"className":"_Session","fields":{"ACL":{"type":"ACL"},"createdAt":{"type":"Date"},"createdWith":{"type":"Object"},"expiresAt":{"type":"Date"},"installationId":{"type":"String"},"objectId":{"type":"String"},"restricted":{"type":"Boolean"},"sessionToken":{"type":"String"},"updatedAt":{"type":"Date"},"user":{"type":"Pointer","targetClass":"_User"}}}]}`;
