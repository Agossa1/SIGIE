import type { Logger } from 'winston';
import { PasswordRepository } from '../repositories/password.repository';
import { BadRequestError, NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { PasswordService } from '../../../../apps/backend/src/config/passwords/passwordServices';

export class ChangePasswordService {
    constructor(
        private readonly repo: PasswordRepository,
        private readonly hash: PasswordService,
        private readonly logger: Logger
    ) {}

    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        const currentHash = await this.repo.getCurrentPasswordHash(userId);
        if (!currentHash) {
            throw new NotFoundError('Utilisateur introuvable');
        }

        const isMatch = await this.hash.comparePassword(oldPassword, currentHash);
        if (!isMatch) {
            throw new BadRequestError('L\'ancien mot de passe est incorrect.');
        }

        if (oldPassword === newPassword) {
            throw new BadRequestError('Le nouveau mot de passe doit être différent de l\'ancien.');
        }

        const newPasswordHash = await this.hash.hashPassword(newPassword);
        await this.repo.updatePassword(userId, newPasswordHash);

        this.logger.info(`changePassword: password changed for userId ${userId}`);
    }
}
