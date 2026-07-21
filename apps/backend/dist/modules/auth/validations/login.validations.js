"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = require("zod");
// Accepte 'identifier' (email ou téléphone) OU 'email' comme alias pour la rétrocompatibilité
const baseSchema = zod_1.z.object({
    identifier: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    password: zod_1.z.string().min(1, 'Le mot de passe est requis'),
});
exports.loginSchema = baseSchema.transform((data) => ({
    identifier: data.identifier ?? data.email ?? '',
    password: data.password,
})).pipe(zod_1.z.object({
    identifier: zod_1.z.string().min(1, 'L\'identifiant (email ou téléphone) est requis'),
    password: zod_1.z.string().min(1, 'Le mot de passe est requis'),
}));
//# sourceMappingURL=login.validations.js.map