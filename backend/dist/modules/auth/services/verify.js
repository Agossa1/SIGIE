"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyService = void 0;
const appErrors_1 = require("../../../../src/shared/errors/appErrors");
class VerifyService {
    constructor(authRepository, logger, authMailer) {
        this.authRepository = authRepository;
        this.logger = logger;
        this.authMailer = authMailer;
    }
    /**
     * Vérifie le compte d'un utilisateur via un code OTP.
     * Envoie le mail de bienvenue après une vérification réussie.
     */
    async verifyAccount(email, code) {
        try {
            // 1. Appel au repository pour valider le code et mettre à jour le statut
            const result = await this.authRepository.verifyUserAccount(email, code);
            if (!result) {
                this.logger.warn(`Verification failed for email: ${email}`);
                throw new appErrors_1.UnauthorizedError('Invalid or expired verification code');
            }
            // 2. Mise à jour de la dernière connexion
            await this.authRepository.updateLastLogin(result.id);
            // 3. Récupération des infos utilisateur pour l'envoi du mail
            const userInfo = await this.authRepository.getUserWithCredentialsByIdentifier(result.id);
            // 4. Envoi du mail de bienvenue via AuthMailer
            if (userInfo) {
                try {
                    await this.authMailer.sendWelcomeEmail(userInfo.email, userInfo.firstName);
                }
                catch (mailError) {
                    this.logger.error(`Failed to send welcome email to ${userInfo.email}:`, mailError);
                }
            }
            this.logger.info(`Account verified and last login updated for email: ${email}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.AppError)
                throw error;
            this.logger.error('Unexpected error during account verification:', error);
            throw new appErrors_1.AppError('An unexpected error occurred during verification', 500);
        }
    }
}
exports.VerifyService = VerifyService;
//# sourceMappingURL=verify.js.map