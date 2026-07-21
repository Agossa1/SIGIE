"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupPasswordController = void 0;
const zod_1 = require("zod");
const setupPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    token: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8)
});
class SetupPasswordController {
    constructor(service) {
        this.service = service;
        this.setupPassword = async (req, res, next) => {
            try {
                const data = setupPasswordSchema.parse(req.body);
                await this.service.setupPassword(data.email, data.token, data.newPassword);
                return res.status(200).json({
                    success: true,
                    message: 'Votre mot de passe a été configuré avec succès. Vous pouvez maintenant vous connecter.'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.SetupPasswordController = SetupPasswordController;
//# sourceMappingURL=setup-password.controller.js.map