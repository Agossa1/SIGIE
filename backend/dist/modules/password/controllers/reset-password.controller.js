"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordController = void 0;
const password_validation_1 = require("../validations/password.validation");
class ResetPasswordController {
    constructor(service) {
        this.service = service;
        this.resetPassword = async (req, res, next) => {
            try {
                const validatedData = password_validation_1.resetPasswordSchema.parse(req.body);
                await this.service.resetPassword(validatedData.email, validatedData.otp, validatedData.newPassword);
                return res.status(200).json({
                    success: true,
                    message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ResetPasswordController = ResetPasswordController;
//# sourceMappingURL=reset-password.controller.js.map