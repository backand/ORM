/**
 * Created by backand on 2/8/16.
 */
/**
 * Created by backand on 2/4/16.
 */
var expect = require("chai").expect;
var _ = require('underscore');
var StatusBL = require('../statusBL');


describe('MigrationTablesApp feature', function () {
    this.timeout(30000);

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
        u.fillSchemaTable('testApp', ['a']).then(() => {
            u.setTableFinish('testApp', 'a').then(() => {
                done();
            });
        })
    })
});


describe('MigrationJobQueue', function () {
    this.timeout(300000);

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

    it('all workers can take job', function (done) {
        u.getNextJob().then((job) => {
            expect(job).not.to.be.undefined;
            u2.getNextJob().then((job2) => {
                expect(job2).not.to.be.undefined;
                expect(job2.id).to.be.equals(job.id);
                done();

            })
        })
    })

    it('after one woker take job, second one can\'t take', function (done) {
        u.getNextJob().then((job) => {
            expect(job).not.to.be.undefined;
            u2.getNextJob().then((job2) => {
                expect(job2).not.to.be.undefined;
                expect(job2.id).to.be.equals(job.id);
                u.takeJob(job).then(() => {
                    u2.getNextJob().then((job3) => {
                        expect(job3).to.be.undefined;
                        done();

                    })
                })

            })
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
