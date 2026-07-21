"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutService = void 0;
const appErrors_1 = require("../../../../src/shared/errors/appErrors");
class LogoutService {
    constructor(authRepository, logger) {
        this.authRepository = authRepository;
        this.logger = logger;
    }
    /**
     * Déconnecte un utilisateur en supprimant sa session.
     */
    async logout(refreshToken) {
        try {
            await this.authRepository.deleteSession(refreshToken);
            this.logger.info(`Session deleted for refresh token: ${refreshToken.substring(0, 10)}...`);
        }
        catch (error) {
            this.logger.error('Error in LogoutService:', error);
            throw new appErrors_1.AppError('Erreur lors de la déconnexion', 500);
        }
    }
    /**
     * Déconnecte un utilisateur de tous ses appareils.
     */
    async logoutFromAllDevices(userId) {
        try {
            await this.authRepository.deleteUserSessions(userId);
            this.logger.info(`All sessions deleted for user: ${userId}`);
        }
        catch (error) {
            this.logger.error('Error in LogoutService (AllDevices):', error);
            throw new appErrors_1.AppError('Erreur lors de la déconnexion globale', 500);
        }
    }
}
exports.LogoutService = LogoutService;
//# sourceMappingURL=logout.js.map