"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionType = exports.MissionStatus = exports.PriorityLevel = void 0;
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel["LOW"] = "low";
    PriorityLevel["MEDIUM"] = "medium";
    PriorityLevel["HIGH"] = "high";
    PriorityLevel["CRITICAL"] = "critical";
    PriorityLevel["EMERGENCY"] = "emergency";
})(PriorityLevel || (exports.PriorityLevel = PriorityLevel = {}));
var MissionStatus;
(function (MissionStatus) {
    MissionStatus["DRAFT"] = "draft";
    MissionStatus["PLANNED"] = "planned";
    MissionStatus["ASSIGNED"] = "assigned";
    MissionStatus["IN_PROGRESS"] = "in_progress";
    MissionStatus["COMPLETED"] = "completed";
    MissionStatus["VALIDATED"] = "validated";
    MissionStatus["CANCELLED"] = "cancelled";
})(MissionStatus || (exports.MissionStatus = MissionStatus = {}));
var MissionType;
(function (MissionType) {
    MissionType["DRAIN_CLEANING"] = "drain_cleaning";
    MissionType["WASTE_COLLECTION"] = "waste_collection";
    MissionType["ROAD_REPAIR"] = "road_repair";
    MissionType["FLOOD_RESPONSE"] = "flood_response";
    MissionType["INSPECTION"] = "inspection";
    MissionType["EMERGENCY_RESPONSE"] = "emergency_response";
    MissionType["SANITATION"] = "sanitation";
    MissionType["MAINTENANCE"] = "maintenance";
    MissionType["REFORESTATION"] = "reforestation";
    MissionType["ECOLOGICAL_RESTORATION"] = "ecological_restoration";
    MissionType["BIODIVERSITY_SURVEY"] = "biodiversity_survey";
})(MissionType || (exports.MissionType = MissionType = {}));
//# sourceMappingURL=missions.types.js.map