"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleSchema = exports.createRoleSchema = void 0;
const zod_1 = require("zod");
exports.createRoleSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).max(50),
    name: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateRoleSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).max(50).optional(),
    name: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=roles.validations.js.map