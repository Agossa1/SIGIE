"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordController = void 0;
const password_validation_1 = require("../validations/password.validation");
const appErrors_1 = require("../../../shared/errors/appErrors");
class ChangePasswordController {
    constructor(service) {
        this.service = service;
        this.changePassword = async (req, res, next) => {
            try {
                const validatedData = password_validation_1.changePasswordSchema.parse(req.body);
                const userId = req.user?.id;
                if (!userId) {
                    throw new appErrors_1.BadRequestError('Utilisateur non authentifié');
                }
                await this.service.changePassword(userId, validatedData.oldPassword, validatedData.newPassword);
                return res.status(200).json({
                    success: true,
                    message: 'Mot de passe modifié avec succès.'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ChangePasswordController = ChangePasswordController;
//# sourceMappingURL=change-password.controller.js.map