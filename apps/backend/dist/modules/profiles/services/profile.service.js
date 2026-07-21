"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class ProfileService {
    constructor(profileRepository, logger) {
        this.profileRepository = profileRepository;
        this.logger = logger;
    }
    /**
     * Récupère le profil complet d'un utilisateur
     */
    async getUserProfile(userId) {
        try {
            return await this.profileRepository.getProfile(userId);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`[ProfileService] Error getting profile for user ${userId}:`, error);
            throw new appErrors_1.BadRequestError('Impossible de charger le profil utilisateur');
        }
    }
    /**
     * Met à jour les informations de profil et les préférences
     */
    async updateProfile(userId, updateData) {
        try {
            // Validation basique : on ne permet pas de modifier l'email via ce service (processus séparé)
            if (updateData.email) {
                delete updateData.email;
            }
            await this.profileRepository.updateProfile(userId, updateData);
            this.logger.info(`[ProfileService] Profile updated for user ${userId}`);
            return await this.profileRepository.getProfile(userId);
        }
        catch (error) {
            this.logger.error(`[ProfileService] Error updating profile for user ${userId}:`, error);
            throw new appErrors_1.BadRequestError('Échec de la mise à jour des informations de profil');
        }
    }
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map