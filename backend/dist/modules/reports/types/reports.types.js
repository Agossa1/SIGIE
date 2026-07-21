"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldAssignmentStatus = exports.WaterFlowStatus = exports.RiskLevel = exports.PriorityLevel = exports.FieldReportStatus = exports.IssueCategory = void 0;
var IssueCategory;
(function (IssueCategory) {
    IssueCategory["DRAINAGE"] = "drainage";
    IssueCategory["WASTE"] = "waste";
    IssueCategory["ROAD"] = "road";
    IssueCategory["LIGHTING"] = "lighting";
    IssueCategory["FLOODING"] = "flooding";
    IssueCategory["BIODIVERSITY"] = "biodiversity";
    IssueCategory["AIR_QUALITY"] = "air_quality";
    IssueCategory["WATER_QUALITY"] = "water_quality";
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
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel["LOW"] = "low";
    PriorityLevel["MEDIUM"] = "medium";
    PriorityLevel["HIGH"] = "high";
    PriorityLevel["CRITICAL"] = "critical";
    PriorityLevel["EMERGENCY"] = "emergency";
})(PriorityLevel || (exports.PriorityLevel = PriorityLevel = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "low";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var WaterFlowStatus;
(function (WaterFlowStatus) {
    WaterFlowStatus["NORMAL"] = "normal";
    WaterFlowStatus["REDUCED"] = "reduced";
    WaterFlowStatus["BLOCKED"] = "blocked";
    WaterFlowStatus["OVERFLOWING"] = "overflowing";
})(WaterFlowStatus || (exports.WaterFlowStatus = WaterFlowStatus = {}));
var FieldAssignmentStatus;
(function (FieldAssignmentStatus) {
    FieldAssignmentStatus["PENDING"] = "pending";
    FieldAssignmentStatus["ACCEPTED"] = "accepted";
    FieldAssignmentStatus["REJECTED"] = "rejected";
    FieldAssignmentStatus["IN_PROGRESS"] = "in_progress";
    FieldAssignmentStatus["COMPLETED"] = "completed";
    FieldAssignmentStatus["CANCELLED"] = "cancelled";
})(FieldAssignmentStatus || (exports.FieldAssignmentStatus = FieldAssignmentStatus = {}));
//# sourceMappingURL=reports.types.js.map