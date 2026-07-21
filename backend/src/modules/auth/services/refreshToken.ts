import { AuthRepository } from "../repositories/auth.repositories";
import type { Logger } from 'winston';
import { TokenManager } from "../../../config/tokens/tokenManager";
import { UnauthorizedError, AppError } from "../../../shared/errors/appErrors";
import { LoginResponse } from "../types/auth.types";

export class RefreshTokenService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly logger: Logger,
        private readonly tokenService: TokenManager
    ) {}

    /**
     * Valide un refresh token et génère une nouvelle paire de tokens.
     */
    public async refresh(refreshToken: string): Promise<LoginResponse> {
        try {
            this.logger.debug("Refresh token attempt", { tokenPrefix: refreshToken.substring(0, 8) });
            
            // 1. Vérification du token en base de données
            const session = await this.authRepository.getSessionByToken(refreshToken);
            if (!session) {
                this.logger.warn('Refresh attempt with invalid or expired session');
                throw new UnauthorizedError('Session expirée ou invalide');
            }

            // 2. Vérification de la signature JWT
            const decoded = this.tokenService.verifyRefreshToken(refreshToken);
            if (!decoded || typeof decoded === 'string' || decoded.id !== session.user_id) {
                this.logger.warn('Refresh token JWT verification failed');
                throw new UnauthorizedError('Token invalide');
            }

            // 3. Récupération de l'utilisateur pour construire le payload
            const user = await this.authRepository.getUserWithCredentialsByIdentifier(session.user_id);
            if (!user) {
                this.logger.warn('User not found during token refresh', { userId: session.user_id });
                throw new UnauthorizedError('Utilisateur non trouvé');
            }

            // 4. Génération des nouveaux tokens
            const payload = { 
                id: user.id, 
                email: user.email, 
                roles: user.roles,
                organizationId: user.organizationId,
                regionId: user.regionId,
                municipalityId: user.municipalityId,
                districtId: user.districtId,
                neighborhoodId: user.neighborhoodId,
                department: user.department,
            };
            const newAccessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken = this.tokenService.generateRefreshToken({ id: user.id });

            // 5. Rotation du refresh token (On supprime l'ancien et on crée le nouveau)
            // Cela empêche le "replay attack"
            await this.authRepository.deleteSession(refreshToken);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
            
            await Promise.all([
                this.authRepository.createSession(user.id, newRefreshToken, expiresAt),
                this.authRepository.updateLastLogin(user.id)
            ]);

            // 6. Préparation de la réponse
            const { credentials, ...safeUser } = user;

            return {
                user: safeUser,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };

        } catch (error) {
            if (error instanceof AppError) throw error;
            this.logger.error('Error in RefreshTokenService:', error);
            throw new AppError('Erreur lors du rafraîchissement du token', 500);
        }
    }
}
