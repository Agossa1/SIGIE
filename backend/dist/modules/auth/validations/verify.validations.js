"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccountSchema = void 0;
const zod_1 = require("zod");
exports.verifyAccountSchema = zod_1.z.object({
    // On s'assure que c'est un UUID valide pour éviter les injections
    email: zod_1.z.string().email("Email invalide"),
    // On s'assure que le code est exactement de 6 chiffres
    code: zod_1.z.string()
        .length(6, "Le code doit faire exactement 6 caractères")
        .regex(/^\d+$/, "Le code ne doit contenir que des chiffres")
});
//# sourceMappingURL=verify.validations.js.map