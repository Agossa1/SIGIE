"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupPasswordService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class SetupPasswordService {
    constructor(repo, hash, logger) {
        this.repo = repo;
        this.hash = hash;
        this.logger = logger;
    }
    /**
     * Configure le mot de passe initial d'un utilisateur créé par un administrateur.
     * Flux : email reçu → OTP vérifié → lien cliqué → mot de passe défini ici.
     */
    async setupPassword(email, token, newPassword) {
        // 1. Trouver l'utilisateur par email
        const user = await this.repo.getUserByEmail(email);
        if (!user) {
            throw new appErrors_1.NotFoundError('Aucun compte trouvé avec cet email');
        }
        // 2. Vérifier la validité du token de setup (via repository)
        const setupToken = await this.repo.getValidSetupToken(user.id, token);
        if (!setupToken) {
            throw new appErrors_1.BadRequestError('Le lien de configuration est invalide ou a expiré. Veuillez contacter votre administrateur.');
        }
        // 3. Hacher le nouveau mot de passe
        const newPasswordHash = await this.hash.hashPassword(newPassword);
        // 4. Appeler le repository pour la transaction (MàJ credentials + invalidation token + activation)
        await this.repo.setupPassword(user.id, setupToken.id, newPasswordHash);
        this.logger.info(`setupPassword: mot de passe configuré avec succès pour ${email}`);
    }
}
exports.SetupPasswordService = SetupPasswordService;
//# sourceMappingURL=setup-password.service.js.map