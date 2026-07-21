"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMunicipalitySchema = void 0;
const zod_1 = require("zod");
const geometrySchema = zod_1.z.any().optional(); // Simplify geometry validation for now
const createNeighborhoodSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(255),
    code: zod_1.z.string().min(1, 'Le code est requis').max(50),
    geometry: geometrySchema,
});
const createDistrictSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(255),
    code: zod_1.z.string().min(1, 'Le code est requis').max(50),
    geometry: geometrySchema,
    neighborhoods: zod_1.z.array(createNeighborhoodSchema).optional(),
});
exports.createMunicipalitySchema = zod_1.z.object({
    organizationId: zod_1.z.string().uuid('ID d\'organisation invalide'),
    code: zod_1.z.string().min(1, 'Le code est requis').max(50),
    name: zod_1.z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(255),
    department: zod_1.z.string().max(255).optional(),
    geometry: geometrySchema,
    districts: zod_1.z.array(createDistrictSchema).optional(),
});
//# sourceMappingURL=create.validations.js.map