import bcrypt from 'bcryptjs';
import type { Logger } from 'winston';
import { PasswordRepository } from '../repositories/password.repository';
import { EmailService } from '../../../../apps/backend/src/shared/services/email.service';

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;

export class ForgotPasswordService {
    constructor(
        private readonly repo: PasswordRepository,
        private readonly emailService: EmailService,
        private readonly logger: Logger
    ) {}

    async forgotPassword(email: string): Promise<void> {
        const user = await this.repo.getUserByEmail(email);
        if (!user) {
            this.logger.warn(`forgotPassword: email not found (silently ignored): ${email}`);
            return;
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = await bcrypt.hash(otpCode, SALT_ROUNDS);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await this.repo.savePasswordResetOtp(user.id, codeHash, expiresAt);
        
        // Log the OTP for local debugging since real emails might not be sent
        this.logger.info(`[DEBUG] OTP for ${email} is: ${otpCode}`);

        await this.emailService.sendPasswordResetEmail(email, otpCode);

        this.logger.info(`forgotPassword: OTP sent to ${email}`);
    }
}
