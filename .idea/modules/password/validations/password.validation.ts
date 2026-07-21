import { z } from 'zod';

export const forgotPasswordSchema = z.object({
    email: z.string().email('Un email valide est requis.').min(1, 'L\'email est obligatoire.'),
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Un email valide est requis.').min(1, 'L\'email est obligatoire.'),
    otp: z.string().length(6, 'Le code OTP doit contenir 6 caractères.').min(1, 'Le code OTP est obligatoire.'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères.'),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'L\'ancien mot de passe est obligatoire.'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères.'),
});

export const verifyCodeSchema = z.object({
    email: z.string().email('Un email valide est requis.').min(1, 'L\'email est obligatoire.'),
    otp: z.string().length(6, 'Le code OTP doit contenir 6 caractères.').min(1, 'Le code OTP est obligatoire.'),
});
