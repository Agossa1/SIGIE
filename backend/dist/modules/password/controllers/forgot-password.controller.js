"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordController = void 0;
const password_validation_1 = require("../validations/password.validation");
class ForgotPasswordController {
    constructor(service) {
        this.service = service;
        this.forgotPassword = async (req, res, next) => {
            try {
                const validatedData = password_validation_1.forgotPasswordSchema.parse(req.body);
                await this.service.forgotPassword(validatedData.email);
                return res.status(200).json({
                    success: true,
                    message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ForgotPasswordController = ForgotPasswordController;
//# sourceMappingURL=forgot-password.controller.js.map