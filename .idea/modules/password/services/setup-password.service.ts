import type { Logger } from 'winston';
import { PasswordRepository } from '../repositories/password.repository';
import { BadRequestError, NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { PasswordService } from '../../../../apps/backend/src/config/passwords/passwordServices';

export class SetupPasswordService {
    constructor(
        private readonly repo: PasswordRepository,
        private readonly hash: PasswordService,
        private readonly logger: Logger
    ) {}

    /**
     * Configure le mot de passe initial d'un utilisateur créé par un administrateur.
     * Flux : email reçu → OTP vérifié → lien cliqué → mot de passe défini ici.
     */
    async setupPassword(email: string, token: string, newPassword: string): Promise<void> {
        // 1. Trouver l'utilisateur par email
        const user = await this.repo.getUserByEmail(email);
        if (!user) {
            throw new NotFoundError('Aucun compte trouvé avec cet email');
        }

        // 2. Vérifier la validité du token de setup (via repository)
        const setupToken = await this.repo.getValidSetupToken(user.id, token);
        if (!setupToken) {
            throw new BadRequestError('Le lien de configuration est invalide ou a expiré. Veuillez contacter votre administrateur.');
        }

        // 3. Hacher le nouveau mot de passe
        const newPasswordHash = await this.hash.hashPassword(newPassword);

        // 4. Appeler le repository pour la transaction (MàJ credentials + invalidation token + activation)
        await this.repo.setupPassword(user.id, setupToken.id, newPasswordHash);

        this.logger.info(`setupPassword: mot de passe configuré avec succès pour ${email}`);
    }
}
