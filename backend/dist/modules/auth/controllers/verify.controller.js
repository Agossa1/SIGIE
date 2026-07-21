"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyController = void 0;
const verify_validations_1 = require("../validations/verify.validations");
/**
 * Contrôleur gérant la vérification des comptes utilisateurs via OTP.
 */
class VerifyController {
    constructor(verifyService) {
        this.verifyService = verifyService;
        /**
         * Valide le code OTP envoyé par l'utilisateur.
         */
        this.verify = async (req, res, next) => {
            try {
                // 1. Validation Zod (ID utilisateur et Code 6 chiffres)
                const validatedData = verify_validations_1.verifyAccountSchema.parse(req.body);
                // 2. Appel au service de vérification métier
                await this.verifyService.verifyAccount(validatedData.email, validatedData.code);
                // 3. Réponse de succès
                return res.status(200).json({
                    success: true,
                    message: 'Votre compte a été vérifié avec succès. Vous pouvez maintenant vous connecter.'
                });
            }
            catch (error) {
                // Transfert vers le middleware global de gestion d'erreurs
                next(error);
            }
        };
    }
}
exports.VerifyController = VerifyController;
//# sourceMappingURL=verify.controller.js.map