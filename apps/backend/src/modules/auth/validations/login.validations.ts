import { z } from 'zod';

// Accepte 'identifier' (email ou téléphone) OU 'email' comme alias pour la rétrocompatibilité
const baseSchema = z.object({
    identifier: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, 'Le mot de passe est requis'),
});

export const loginSchema = baseSchema.transform((data) => ({
    identifier: data.identifier ?? data.email ?? '',
    password: data.password,
})).pipe(z.object({
    identifier: z.string().min(1, 'L\'identifiant (email ou téléphone) est requis'),
    password: z.string().min(1, 'Le mot de passe est requis'),
}));


export type LoginDTO = z.infer<typeof loginSchema>;