"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class ChangePasswordService {
    constructor(repo, hash, logger) {
        this.repo = repo;
        this.hash = hash;
        this.logger = logger;
    }
    async changePassword(userId, oldPassword, newPassword) {
        const currentHash = await this.repo.getCurrentPasswordHash(userId);
        if (!currentHash) {
            throw new appErrors_1.NotFoundError('Utilisateur introuvable');
        }
        const isMatch = await this.hash.comparePassword(oldPassword, currentHash);
        if (!isMatch) {
            throw new appErrors_1.BadRequestError('L\'ancien mot de passe est incorrect.');
        }
        if (oldPassword === newPassword) {
            throw new appErrors_1.BadRequestError('Le nouveau mot de passe doit être différent de l\'ancien.');
        }
        const newPasswordHash = await this.hash.hashPassword(newPassword);
        await this.repo.updatePassword(userId, newPasswordHash);
        this.logger.info(`changePassword: password changed for userId ${userId}`);
    }
}
exports.ChangePasswordService = ChangePasswordService;
//# sourceMappingURL=change-password.service.js.map