"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    type: zod_1.z.string().min(1).max(50),
    municipalityId: zod_1.z.string().uuid().optional(),
    regionId: zod_1.z.string().uuid().optional(),
});
exports.updateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    type: zod_1.z.string().min(1).max(50).optional(),
});
//# sourceMappingURL=organizations.validations.js.map