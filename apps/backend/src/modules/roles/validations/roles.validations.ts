import { z } from 'zod';

export const createRoleSchema = z.object({
    code: z.string().min(2).max(50),
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
});

export const updateRoleSchema = z.object({
    code: z.string().min(2).max(50).optional(),
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
});

export type CreateRoleDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>;