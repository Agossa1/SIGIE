import { z } from 'zod';

export const createUserSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8).optional(),
    role: z.string().optional(),
    organizationId: z.string().uuid().optional(),
    municipalityId: z.string().uuid().optional(),
    regionId: z.string().uuid().optional(),
    districtId: z.string().uuid().optional(),
    neighborhoodId: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
    organizationId: z.string().uuid().optional(),
    municipalityId: z.string().uuid().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    roles: z.array(z.string()).optional(),
    status: z.enum(['pending', 'active', 'suspended', 'disabled']).optional(),
});

export const updateUserStatusSchema = z.object({
    status: z.enum(['pending', 'active', 'suspended', 'disabled']),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;