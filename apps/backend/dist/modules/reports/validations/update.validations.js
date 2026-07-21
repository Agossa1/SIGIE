"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReportSchema = void 0;
const zod_1 = require("zod");
const reports_types_1 = require("../types/reports.types");
exports.updateReportSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(255).optional(),
    description: zod_1.z.string().max(5000).optional(),
    issueCategory: zod_1.z.nativeEnum(reports_types_1.IssueCategory).optional(),
    priority: zod_1.z.nativeEnum(reports_types_1.PriorityLevel).optional(),
    riskLevel: zod_1.z.nativeEnum(reports_types_1.RiskLevel).optional(),
    status: zod_1.z.nativeEnum(reports_types_1.FieldReportStatus).optional(),
    assignedTo: zod_1.z.string().uuid().optional(),
    resolvedAt: zod_1.z.string().datetime().optional(),
    slaHours: zod_1.z.number().int().min(1).max(720).optional(),
});
//# sourceMappingURL=update.validations.js.map