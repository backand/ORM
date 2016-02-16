var Report = require('../report');
var _ = require('underscore');
describe('can run reporter', function () {
    it('do something', function () {
        var report = new Report("./reports/reportTest.json");
        report.insertClassSuccess("c1", 15);
        report.insertClassSuccess("c1", 17);
        report.insertClassError("c1", {message: "error1 occured"});
        report.insertClassError("c2", {message: "error2 occured"});
        report.insertClassSuccess("c2", 17);
        report.insertClassError("c2", {message: "error3 occured"});
        report.generalError({message: "error4 occured"});
        report.updatePointerError("c1", {message: "error5 occured"});
        report.updatePointerError("c1", {message: "error5 occured"});
        report.updatePointerError("c1", {message: "error9 occured"});
        report.updatePointerSuccess("c1", 3);
        report.updateRelationError("c1", "r1", {message: "error6 occured"});
        report.updateRelationSuccess("c1", "r1", 3);
        report.updateRelationError("c1", "r1", {message: "error7 occured"});
        report.updateRelationSuccess("c1", "r1", 4);
        report.updateRelationError("c1", "r2", {message: "error8 occured"});
        report.updateRelationSuccess("c1", "r2", 4);
        report.write();
    });

    it('can create html', function (done) {
        var report = new Report("test2.html", 'parsetest2');


        var data = {
            hasErrors: true,
            logs: {},
            transform: [
                {originalName: 'c', adjustedName: '_Role'},
                {originalName: 'Section', fields: [{originalName: "column.originalName", adjustedName: "property"}]}
            ]
            ,
            errors: {

                general: [],
                _Session: {
                    inserts: [
                        "can't access some file"
                    ]
                },
                _User: {
                    inserts: [
                        "can't access some file"
                    ],
                    update: [
                        'another problem',
                        'third problem'
                    ]
                }
            },
            statistics: {
                _User: {
                    inserts: 3
                },
                _Role: {
                    inserts: 3,
                    relations: {
                        roles: 3,
                        users: 3
                    }
                },
                Section: {
                    inserts: 1
                },
                Topic: {
                    inserts: 2
                }
            }
        };

        var ff = _.find(data.transform, function(f) { return f.originalName == 'b' || f.adjustedName == 'b' });
        console.log(ff);
        _.each(_.allKeys(data.statistics), function (name) {
            console.log(name);
        });
        report.setData(data);
        report.write();
        done();
    });


})
