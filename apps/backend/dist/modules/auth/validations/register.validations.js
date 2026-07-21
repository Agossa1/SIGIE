"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = require("zod");
const auth_types_1 = require("../types/auth.types");
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters long'),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters long'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits long').optional(),
    password: zod_1.z.union([
        zod_1.z.string()
            .min(8, "Le mot de passe doit faire au moins 8 caractères")
            .regex(/[A-Z]/, "Il faut au moins une majuscule")
            .regex(/[0-9]/, "Il faut au moins un chiffre"),
        zod_1.z.literal(''),
        zod_1.z.undefined(),
    ]).optional().transform(val => (val === '' ? undefined : val)),
    role: zod_1.z.nativeEnum(auth_types_1.Role).default(auth_types_1.Role.TECHNICIAN),
    type: zod_1.z.nativeEnum(auth_types_1.AccountType).default(auth_types_1.AccountType.USER),
    organizationId: zod_1.z.string().uuid().optional(),
    municipalityId: zod_1.z.string().uuid().optional(),
    regionId: zod_1.z.string().uuid().optional(),
    districtId: zod_1.z.string().uuid().optional(),
    neighborhoodId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=register.validations.js.map