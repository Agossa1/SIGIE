"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldReportStatus = exports.IssueCategory = void 0;
var IssueCategory;
(function (IssueCategory) {
    IssueCategory["DRAINAGE"] = "drainage";
    IssueCategory["WASTE"] = "waste";
    IssueCategory["ROAD"] = "road";
    IssueCategory["LIGHTING"] = "lighting";
    IssueCategory["FLOODING"] = "flooding";
    IssueCategory["OTHER"] = "other";
})(IssueCategory || (exports.IssueCategory = IssueCategory = {}));
var FieldReportStatus;
(function (FieldReportStatus) {
    FieldReportStatus["DRAFT"] = "draft";
    FieldReportStatus["SUBMITTED"] = "submitted";
    FieldReportStatus["ASSIGNED"] = "assigned";
    FieldReportStatus["IN_PROGRESS"] = "in_progress";
    FieldReportStatus["RESOLVED"] = "resolved";
    FieldReportStatus["VALIDATED"] = "validated";
    FieldReportStatus["REJECTED"] = "rejected";
})(FieldReportStatus || (exports.FieldReportStatus = FieldReportStatus = {}));
//# sourceMappingURL=field-ops.types.js.map