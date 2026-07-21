import { z } from 'zod';

export const createAlertSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    alertType: z.string().min(1).max(50),
    severity: z.enum(['info', 'warning', 'critical', 'emergency']).optional(),
    municipalityId: z.string().uuid().optional(),
    regionId: z.string().uuid().optional(),
    validUntil: z.string().optional(),
});

export type CreateAlertDTO = z.infer<typeof createAlertSchema>;