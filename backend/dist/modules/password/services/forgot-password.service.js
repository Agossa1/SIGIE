"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;
class ForgotPasswordService {
    constructor(repo, emailService, logger) {
        this.repo = repo;
        this.emailService = emailService;
        this.logger = logger;
    }
    async forgotPassword(email) {
        const user = await this.repo.getUserByEmail(email);
        if (!user) {
            this.logger.warn(`forgotPassword: email not found (silently ignored): ${email}`);
            return;
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = await bcryptjs_1.default.hash(otpCode, SALT_ROUNDS);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await this.repo.savePasswordResetOtp(user.id, codeHash, expiresAt);
        // Log the OTP for local debugging since real emails might not be sent
        this.logger.info(`[DEBUG] OTP for ${email} is: ${otpCode}`);
        await this.emailService.sendPasswordResetEmail(email, otpCode);
        this.logger.info(`forgotPassword: OTP sent to ${email}`);
    }
}
exports.ForgotPasswordService = ForgotPasswordService;
//# sourceMappingURL=forgot-password.service.js.map