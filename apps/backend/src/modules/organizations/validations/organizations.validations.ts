import { z } from 'zod';

export const createOrganizationSchema = z.object({
    name: z.string().min(1).max(200),
    type: z.string().min(1).max(50),
    municipalityId: z.string().uuid().optional(),
    regionId: z.string().uuid().optional(),
});

export const updateOrganizationSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    type: z.string().min(1).max(50).optional(),
});

export type CreateOrganizationDTO = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationSchema>;