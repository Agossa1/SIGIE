"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyCodeController = void 0;
const password_validation_1 = require("../validations/password.validation");
class VerifyCodeController {
    constructor(service) {
        this.service = service;
        this.verifyCode = async (req, res, next) => {
            try {
                const validatedData = password_validation_1.verifyCodeSchema.parse(req.body);
                await this.service.verifyCode(validatedData.email, validatedData.otp);
                return res.status(200).json({
                    success: true,
                    message: 'Le code OTP est valide.'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.VerifyCodeController = VerifyCodeController;
//# sourceMappingURL=verify-code.controller.js.map