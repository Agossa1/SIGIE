"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlertSchema = void 0;
const zod_1 = require("zod");
exports.createAlertSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    alertType: zod_1.z.string().min(1).max(50),
    severity: zod_1.z.enum(['info', 'warning', 'critical', 'emergency']).optional(),
    municipalityId: zod_1.z.string().uuid().optional(),
    regionId: zod_1.z.string().uuid().optional(),
    validUntil: zod_1.z.string().optional(),
});
//# sourceMappingURL=alerts.validations.js.map