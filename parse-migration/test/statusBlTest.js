/**
 * Created by backand on 2/8/16.
 */
/**
 * Created by backand on 2/4/16.
 */
var expect = require("chai").expect;
var _ = require('underscore');
var StatusBL = require('../statusBL');
var q = require('q');
q.longStackSupport = true;

describe('can multiple workers', function () {
    it('dont have same id', function (done) {
        var u = new StatusBL(1);
        var u2 = new StatusBL(2);
        expect(u.getWorkerId()).to.not.be.equals(u2.getWorkerId());
        done();
    });
})

describe('MigrationTablesApp feature', function () {
    this.timeout(10000);

    var u = new StatusBL(1);

    before(function (done) {
        u.connect()
            .then(function () {
                u.cleanup().then(function () {
                    done();
                });
            });
    })

    it('can insert table single', function (done) {
        u.fillSchemaTable('testApp', 0, ['a']).then(() => {
            u.setTableFinish('testApp', 'a').then(() => {
                done();
            });
        })
    })
});


describe('MigrationJobQueue', function () {
    this.timeout(100000);

    var u = new StatusBL(1);

    before(function (done) {
        u.connect()
            .then(function () {
                u.cleanup()
                    .then(function () {
                        u.enqueueSimpleJob().then(function () {
                            done();
                        })
                    });
            });
    })

    var currentJob;

    it('can take job', function (done) {
        u.getNextJob().then((job) => {
            expect(job).not.to.be.undefined;
            currentJob = job;
            done();
            if (job) {
            }
            else {
                // set timeout
            }
        })
    })


    it('can finish job and will not be found again', (done) => {
        u.getNextJob().then((job) => {
            u.finishJob(job).then(() => {
                u.getNextJob().then((job2) => {
                    expect(job2).to.be.undefined;
                    done();
                })
            });
        })
    })
})


describe('MigrationJobQueue Multiple Workers', function () {
    this.timeout(300000);

    var u = new StatusBL(1);
    var u2 = new StatusBL(2);
    before(function (done) {
        u.connect()
            .then(u.cleanup)
            .then(u.enqueueSimpleJob)
            .then(function () {
                done();
            })
            .fail(function (err) {
                logger.error(err);
            })
    })

    var currentJob;
    var firstJob;
    it('all workers can take job', function (done) {
        u.getNextJob()
            .then((job) => {
                expect(job).not.to.be.undefined;
                firstJob = job;
                return u2.getNextJob()
            })
            .then((job2) => {
                expect(job2).not.to.be.undefined;
                expect(job2.id).to.be.equals(firstJob.id);
                done();
            })
            .fail(function (err) {
                logger.error(err);
            })
    })

    it('after one woker take job, second one can\'t take', function (done) {
        u.getNextJob()
            .then((job) => {
                expect(job).not.to.be.undefined;
                firstJob = job;
                return q(undefined)
            })
            .then(u2.getNextJob)
            .then((job2) => {
                expect(job2).not.to.be.undefined;
                expect(job2.id).to.be.equals(firstJob.id);
                return u.takeJob(firstJob)
            })
            .then(u2.getNextJob)
            .then((job3) => {
                expect(job3).to.be.undefined;
                done();

            })
            .fail(function (err) {
                logger.error(err);
            })
    })

    it('can finish job and will not be found again', (done) => {
        /* u.enqueueSimpleJob()
         .
         */
        u.getNextJob()
            .then((job) => {

                if (!job) {
                    console.log('here1');
                    return u.enqueueSimpleJob()
                }
                else {
                    console.log('here2');

                    return q.fcall(() => job);
                }
            }).then((job) => u.finishJob(job))
            .then(u.getNextJob)
            .then((job2) => {
                expect(job2).to.be.undefined;
                done();
            })
            .fail(function (err) {
                logger.error(err);
            })
    });

})




