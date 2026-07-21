import { z } from 'zod';

export const createWastePointSchema = z.object({
    name: z.string().min(1).max(200),
    municipalityId: z.string().uuid().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    wasteType: z.string().optional(),
});

export const createCollectionSchema = z.object({
    municipalityId: z.string().uuid().optional(),
    collectionDate: z.string(),
    volumeCollected: z.number().optional(),
    teamId: z.string().uuid().optional(),
});

export type CreateWastePointDTO = z.infer<typeof createWastePointSchema>;
export type CreateCollectionDTO = z.infer<typeof createCollectionSchema>;