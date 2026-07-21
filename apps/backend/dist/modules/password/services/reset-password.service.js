"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class ResetPasswordService {
    constructor(repo, hash, logger) {
        this.repo = repo;
        this.hash = hash;
        this.logger = logger;
    }
    async resetPassword(email, otp, newPassword) {
        const user = await this.repo.getUserByEmail(email);
        if (!user) {
            throw new appErrors_1.NotFoundError('Aucun compte trouvé avec cet email');
        }
        const storedOtp = await this.repo.getValidPasswordResetOtp(user.id);
        if (!storedOtp) {
            throw new appErrors_1.BadRequestError('Le code OTP est invalide ou a expiré. Veuillez refaire une demande.');
        }
        const isMatch = await bcryptjs_1.default.compare(otp, storedOtp.codeHash);
        if (!isMatch) {
            throw new appErrors_1.BadRequestError('Le code OTP est incorrect.');
        }
        const newPasswordHash = await this.hash.hashPassword(newPassword);
        await this.repo.resetPassword(user.id, storedOtp.id, newPasswordHash);
        this.logger.info(`resetPassword: password reset successfully for ${email}`);
    }
}
exports.ResetPasswordService = ResetPasswordService;
//# sourceMappingURL=reset-password.service.js.map