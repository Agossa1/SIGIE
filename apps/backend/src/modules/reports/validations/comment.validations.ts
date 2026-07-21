import { z } from 'zod';

export const createCommentSchema = z.object({
    body: z.string().min(1, 'Le commentaire ne peut pas être vide').max(2000),
    isInternal: z.boolean().default(true),
});

export type CreateCommentDTO = z.infer<typeof createCommentSchema>;