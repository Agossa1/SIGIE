"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatusSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(100),
    lastName: zod_1.z.string().min(1).max(100),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8).optional(),
    role: zod_1.z.string().optional(),
    organizationId: zod_1.z.string().uuid().optional(),
    municipalityId: zod_1.z.string().uuid().optional(),
    regionId: zod_1.z.string().uuid().optional(),
    districtId: zod_1.z.string().uuid().optional(),
    neighborhoodId: zod_1.z.string().uuid().optional(),
});
exports.updateUserSchema = zod_1.z.object({
    organizationId: zod_1.z.string().uuid().optional(),
    municipalityId: zod_1.z.string().uuid().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    firstName: zod_1.z.string().min(1).max(100).optional(),
    lastName: zod_1.z.string().min(1).max(100).optional(),
    roles: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['pending', 'active', 'suspended', 'disabled']).optional(),
});
exports.updateUserStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'active', 'suspended', 'disabled']),
});
//# sourceMappingURL=users.validations.js.map