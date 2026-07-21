import { z } from 'zod';
import { Role, AccountType } from '../types/auth.types';

export const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters long'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits long').optional(),
    password: z.union([
        z.string()
            .min(8, "Le mot de passe doit faire au moins 8 caractères")
            .regex(/[A-Z]/, "Il faut au moins une majuscule")
            .regex(/[0-9]/, "Il faut au moins un chiffre"),
        z.literal(''),
        z.undefined(),
    ]).optional().transform(val => (val === '' ? undefined : val)),
    role: z.nativeEnum(Role).default(Role.TECHNICIAN),
    type: z.nativeEnum(AccountType).default(AccountType.USER),
    organizationId: z.string().uuid().optional(),
    municipalityId: z.string().uuid().optional(),
    regionId: z.string().uuid().optional(),
    districtId: z.string().uuid().optional(),
    neighborhoodId: z.string().uuid().optional(),
})

export type RegisterDTO = z.infer<typeof registerSchema>;