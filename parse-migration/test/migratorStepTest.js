/**
 * Created by backand on 2/23/16.
 */

var Migrator = require('../Migrator');
var migrator = new Migrator();
const assert = require('assert');

describe('step change based on jobstatus', function () {

    it('undefined jobstatus return all', function (done) {
        res = migrator.getSteps(undefined,undefined);
        //console.log(res);
        assert(res.length == 5);
        done();
    })

    it('statusName undeifned  return all', function (done) {
        res = migrator.getSteps({'statusName' : undefined},undefined);
        //console.log(res);
        assert(res.length == 5);
        done();
    })

    it('statusName not existing return all', function (done) {
        res = migrator.getSteps({'statusName' : "34234234"},undefined);
        //console.log(res);
        assert(res.length == 5);
        done();
    })

    it('status name instertClass return all', function (done) {
        res = migrator.getSteps({'statusName' : 'instertClass'},undefined);
        //console.log(res);
        assert(res.length == 5);
        done();
    })

    it('status name updatePointer return 4', function (done) {
        res = migrator.getSteps({'statusName' : 'updatePointer'},undefined);
        //console.log(res);
        assert(res.length == 4);
        done();
    })


    it('status name updateRelation 3', function (done) {
        res = migrator.getSteps({'statusName' : 'updateRelation'},undefined);
        //console.log(res);
        assert(res.length == 3);
        done();
    })

    it('status name updateUsers 2', function (done) {
        res = migrator.getSteps({'statusName' : 'updateUsers'},undefined);
        //console.log(res);
        assert(res.length == 2);
        done();
    })

})

