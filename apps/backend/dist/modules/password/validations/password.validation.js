"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCodeSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = void 0;
const zod_1 = require("zod");
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Un email valide est requis.').min(1, 'L\'email est obligatoire.'),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Un email valide est requis.').min(1, 'L\'email est obligatoire.'),
    otp: zod_1.z.string().length(6, 'Le code OTP doit contenir 6 caractères.').min(1, 'Le code OTP est obligatoire.'),
    newPassword: zod_1.z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères.'),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, 'L\'ancien mot de passe est obligatoire.'),
    newPassword: zod_1.z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères.'),
});
exports.verifyCodeSchema = zod_1.z.object({
    email: zod_1.z.string().email('Un email valide est requis.').min(1, 'L\'email est obligatoire.'),
    otp: zod_1.z.string().length(6, 'Le code OTP doit contenir 6 caractères.').min(1, 'Le code OTP est obligatoire.'),
});
//# sourceMappingURL=password.validation.js.map