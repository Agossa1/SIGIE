"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_TYPES = exports.VALID_STATUSES = exports.InterventionType = exports.InterventionStatus = void 0;
/**
 * Statuts possibles d'une intervention.
 * Utiliser cet enum partout à la place des strings bruts.
 */
var InterventionStatus;
(function (InterventionStatus) {
    InterventionStatus["PENDING"] = "pending";
    InterventionStatus["ACCEPTED"] = "accepted";
    InterventionStatus["REJECTED"] = "rejected";
    InterventionStatus["IN_PROGRESS"] = "in_progress";
    InterventionStatus["COMPLETED"] = "completed";
    InterventionStatus["CANCELLED"] = "cancelled";
})(InterventionStatus || (exports.InterventionStatus = InterventionStatus = {}));
/**
 * Types d'intervention reconnus par le système.
 */
var InterventionType;
(function (InterventionType) {
    InterventionType["DRAIN_CLEANING"] = "drain_cleaning";
    InterventionType["WASTE_COLLECTION"] = "waste_collection";
    InterventionType["ROAD_REPAIR"] = "road_repair";
    InterventionType["FLOOD_RESPONSE"] = "flood_response";
    InterventionType["INSPECTION"] = "inspection";
    InterventionType["EMERGENCY_RESPONSE"] = "emergency_response";
    InterventionType["SANITATION"] = "sanitation";
    InterventionType["MAINTENANCE"] = "maintenance";
})(InterventionType || (exports.InterventionType = InterventionType = {}));
/** Ensemble des statuts valides sous forme de Set pour validation rapide O(1). */
exports.VALID_STATUSES = new Set(Object.values(InterventionStatus));
/** Ensemble des types valides sous forme de Set pour validation rapide O(1). */
exports.VALID_TYPES = new Set(Object.values(InterventionType));
//# sourceMappingURL=interventions.enums.js.map