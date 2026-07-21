import { AuthRepository } from "../repositories/auth.repositories";
import type { Logger } from 'winston';
import { AppError } from "../../../../src/shared/errors/appErrors";

export class LogoutService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly logger: Logger
    ) {}

    /**
     * Déconnecte un utilisateur en supprimant sa session.
     */
    public async logout(refreshToken: string): Promise<void> {
        try {
            await this.authRepository.deleteSession(refreshToken);
            this.logger.info(`Session deleted for refresh token: ${refreshToken.substring(0, 10)}...`);
        } catch (error) {
            this.logger.error('Error in LogoutService:', error);
            throw new AppError('Erreur lors de la déconnexion', 500);
        }
    }

    /**
     * Déconnecte un utilisateur de tous ses appareils.
     */
    public async logoutFromAllDevices(userId: string): Promise<void> {
        try {
            await this.authRepository.deleteUserSessions(userId);
            this.logger.info(`All sessions deleted for user: ${userId}`);
        } catch (error) {
            this.logger.error('Error in LogoutService (AllDevices):', error);
            throw new AppError('Erreur lors de la déconnexion globale', 500);
        }
    }
}
