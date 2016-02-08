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

    it('can set finish to single table', function (done) {
        var u = new StatusBL();

        u.connect()
            .then(function () {
                u.setTableFinish('testApp', 'a');
                done();
            });
    })

    it('can insert table single', function (done) {
        var u = new StatusBL();
        u.connect()
            .then(() => {
                u.fillSchemaTable('testApp', ['a'])
            })
            .then(() => {
                u.setTableFinish('testApp', 'a').then(done);
            })
    });
})

