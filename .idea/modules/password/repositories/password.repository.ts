import crypto from 'crypto';
import type { Logger } from 'winston';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { BadRequestError, NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class PasswordRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) {}

    /**
     * Recherche un utilisateur par email. Retourne null si inexistant.
     */
    async getUserByEmail(email: string): Promise<{ id: string; firstName: string; lastName: string; email: string; status: string } | null> {
        try {
            const sql = `
                SELECT id, first_name as "firstName", last_name as "lastName", email, status
                FROM users
                WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL
            `;
            const result = await this.db.query(sql, [email]);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error('PasswordRepository.getUserByEmail error:', error);
            throw new BadRequestError('Erreur lors de la recherche de l\'utilisateur');
        }
    }

    /**
     * Invalide tous les OTP password_reset existants pour cet utilisateur,
     * puis sauvegarde le nouveau code OTP haché.
     */
    async savePasswordResetOtp(userId: string, codeHash: string, expiresAt: Date): Promise<void> {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            // Invalider les anciens OTPs de même type
            await client.query(
                `UPDATE user_otps SET verified = true, verified_at = NOW() WHERE user_id = $1 AND otp_type = 'password_reset' AND verified = false`,
                [userId]
            );
            // Insérer le nouvel OTP
            await client.query(
                `INSERT INTO user_otps (id, user_id, code_hash, otp_type, expires_at) VALUES ($1, $2, $3, 'password_reset', $4)`,
                [crypto.randomUUID(), userId, codeHash, expiresAt]
            );
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('PasswordRepository.savePasswordResetOtp error:', error);
            throw new BadRequestError('Erreur lors de la sauvegarde du code OTP');
        } finally {
            client.release();
        }
    }

    /**
     * Récupère l'OTP password_reset valide (non expiré, non vérifié) pour un utilisateur.
     */
    async getValidPasswordResetOtp(userId: string): Promise<{ id: string; codeHash: string } | null> {
        try {
            const sql = `
                SELECT id, code_hash as "codeHash"
                FROM user_otps
                WHERE user_id = $1 
                  AND otp_type = 'password_reset' 
                  AND verified = false 
                  AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1
            `;
            const result = await this.db.query(sql, [userId]);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error('PasswordRepository.getValidPasswordResetOtp error:', error);
            throw new BadRequestError('Erreur lors de la vérification du code OTP');
        }
    }

    /**
     * Met à jour le mot de passe haché dans la table credentials
     * et invalide l'OTP utilisé. Transaction ACID.
     */
    async resetPassword(userId: string, otpId: string, newPasswordHash: string): Promise<void> {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            // 1. Mettre à jour le mot de passe
            await client.query(
                `UPDATE credentials SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`,
                [newPasswordHash, userId]
            );
            // 2. Invalider l'OTP
            await client.query(
                `UPDATE user_otps SET verified = true, verified_at = NOW() WHERE id = $1`,
                [otpId]
            );
            // 3. Révoquer toutes les sessions actives (sécurité)
            await client.query(
                `DELETE FROM user_sessions WHERE user_id = $1`,
                [userId]
            );
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('PasswordRepository.resetPassword error:', error);
            throw new BadRequestError('Erreur lors de la réinitialisation du mot de passe');
        } finally {
            client.release();
        }
    }

    /**
     * Récupère le hash du mot de passe actuel pour vérification (changePassword).
     */
    async getCurrentPasswordHash(userId: string): Promise<string | null> {
        try {
            const sql = `SELECT password_hash as "passwordHash" FROM credentials WHERE user_id = $1`;
            const result = await this.db.query(sql, [userId]);
            return result.rows[0]?.passwordHash || null;
        } catch (error) {
            this.logger.error('PasswordRepository.getCurrentPasswordHash error:', error);
            throw new BadRequestError('Erreur lors de la récupération des informations de sécurité');
        }
    }

    /**
     * Met à jour le mot de passe (utilisé pour changePassword).
     */
    async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
        try {
            await this.db.query(
                `UPDATE credentials SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`,
                [newPasswordHash, userId]
            );
        } catch (error) {
            this.logger.error('PasswordRepository.updatePassword error:', error);
            throw new BadRequestError('Erreur lors de la mise à jour du mot de passe');
        }
    }

    /**
     * Récupère le token de configuration de mot de passe valide (non expiré, non vérifié).
     * Utilisé par le flux d'invitation / création d'utilisateur par un admin.
     */
    async getValidSetupToken(userId: string, token: string): Promise<{ id: string } | null> {
        try {
            const sql = `
                SELECT id
                FROM user_otps
                WHERE user_id = $1
                  AND code_hash = $2
                  AND otp_type = 'password_setup_token'
                  AND expires_at > NOW()
                  AND verified = false
            `;
            const result = await this.db.query(sql, [userId, token]);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error('PasswordRepository.getValidSetupToken error:', error);
            throw new BadRequestError('Erreur lors de la vérification du token');
        }
    }

    /**
     * Configure le mot de passe initial d'un utilisateur via le lien de setup.
     * Transaction ACID : mise à jour credentials + invalidation token + activation compte.
     */
    async setupPassword(userId: string, otpId: string, newPasswordHash: string): Promise<void> {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Mettre à jour le mot de passe
            await client.query(
                `UPDATE credentials SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`,
                [newPasswordHash, userId]
            );

            // 2. Invalider le token de setup une fois utilisé
            await client.query(
                `UPDATE user_otps SET verified = true, verified_at = NOW() WHERE id = $1`,
                [otpId]
            );

            // 3. Activer le compte si encore en pending (sécurité supplémentaire)
            await client.query(
                `UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1 AND status = 'pending'`,
                [userId]
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('PasswordRepository.setupPassword error:', error);
            throw new BadRequestError('Erreur lors de la configuration du mot de passe');
        } finally {
            client.release();
        }
    }
}
