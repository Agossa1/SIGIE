import { z } from 'zod';

const geometrySchema = z.any().optional(); // Simplify geometry validation for now

const createNeighborhoodSchema = z.object({
    name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(255),
    code: z.string().min(1, 'Le code est requis').max(50),
    geometry: geometrySchema,
});

const createDistrictSchema = z.object({
    name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(255),
    code: z.string().min(1, 'Le code est requis').max(50),
    geometry: geometrySchema,
    neighborhoods: z.array(createNeighborhoodSchema).optional(),
});

export const createMunicipalitySchema = z.object({
    organizationId: z.string().uuid('ID d\'organisation invalide'),
    code: z.string().min(1, 'Le code est requis').max(50),
    name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(255),
    department: z.string().max(255).optional(),
    geometry: geometrySchema,
    districts: z.array(createDistrictSchema).optional(),
});

export type CreateMunicipalityValidatedDTO = z.infer<typeof createMunicipalitySchema>;
