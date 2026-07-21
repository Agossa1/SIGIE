import type { Logger } from 'winston';
import { PasswordRepository } from '../repositories/password.repository';
import { BadRequestError, NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';
import bcrypt from 'bcryptjs';

export class VerifyCodeService {
    constructor(
        private readonly repo: PasswordRepository,
        private readonly logger: Logger
    ) {}

    async verifyCode(email: string, otp: string): Promise<void> {
        const user = await this.repo.getUserByEmail(email);
        if (!user) {
            throw new NotFoundError('Aucun compte trouvé avec cet email');
        }

        const storedOtp = await this.repo.getValidPasswordResetOtp(user.id);
        if (!storedOtp) {
            throw new BadRequestError('Le code OTP est invalide ou a expiré. Veuillez refaire une demande.');
        }

        const isMatch = await bcrypt.compare(otp, storedOtp.codeHash);
        if (!isMatch) {
            throw new BadRequestError('Le code OTP est incorrect.');
        }

        this.logger.info(`verifyCode: OTP verified successfully for ${email}`);
    }
}
