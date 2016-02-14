var Report = require('../report');

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
    })
})
