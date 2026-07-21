import type { Logger } from 'winston';
import { PasswordRepository } from '../repositories/password.repository';
import { BadRequestError, NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { PasswordService } from '../../../../apps/backend/src/config/passwords/passwordServices';
import bcrypt from 'bcryptjs';

export class ResetPasswordService {
    constructor(
        private readonly repo: PasswordRepository,
        private readonly hash: PasswordService,
        private readonly logger: Logger
    ) {}

    async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
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

        const newPasswordHash = await this.hash.hashPassword(newPassword);

        await this.repo.resetPassword(user.id, storedOtp.id, newPasswordHash);

        this.logger.info(`resetPassword: password reset successfully for ${email}`);
    }
}
