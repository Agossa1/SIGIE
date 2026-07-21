"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyCodeService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class VerifyCodeService {
    constructor(repo, logger) {
        this.repo = repo;
        this.logger = logger;
    }
    async verifyCode(email, otp) {
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
        this.logger.info(`verifyCode: OTP verified successfully for ${email}`);
    }
}
exports.VerifyCodeService = VerifyCodeService;
//# sourceMappingURL=verify-code.service.js.map