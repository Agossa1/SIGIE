import type { Logger } from 'winston';
import crypto from 'crypto';
import PostgresDatabase from '../../../../src/infra/database/postgres';
import { AuthUser, User, Credentials, Role, UserStatus, AccountType } from '../types/auth.types';
import { BadRequestError } from '../../../../src/shared/errors/appErrors';

/**
 * Repository gérant toutes les opérations de base de données liées à l'authentification.
 * Aligné sur le schéma HSE TERRA (tables: users, credentials, role_user, user_sessions, user_otps).
 */
export class AuthRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) { }

    /**
     * Crée un utilisateur complet avec ses identifiants et son rôle dans une transaction.
     */
    public async createUser(dto: User, credentials: Credentials, role: Role): Promise<AuthUser> {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            const now = new Date();

            // 1. Insertion dans la table 'users'
            const userSql = `
                INSERT INTO users (
                    id, organization_id, region_id, municipality_id, district_id, neighborhood_id,
                    first_name, last_name, email, phone, type, status, created_by, created_at, updated_at
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
                RETURNING *`;
            const params = [
                dto.id,
                dto.organizationId,
                dto.regionId ?? null,
                dto.municipalityId,
                dto.districtId ?? null,
                dto.neighborhoodId ?? null,
                dto.firstName,
                dto.lastName,
                dto.email,
                dto.phone,
                dto.type || AccountType.USER,
                dto.status || UserStatus.PENDING,
                dto.createdBy ?? null,
                now,
                now
            ]
            const userResult = await client.query(userSql, params);
            const createdUser = userResult.rows[0];

            // 2. Insertion dans la table 'credentials'
            const creSql = `
                INSERT INTO credentials (id, user_id, password_hash, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5)`;
            const creParams = [
                credentials.id,
                dto.id,
                credentials.passwordHash,
                now,
                now
            ]
            await client.query(creSql, creParams);

            // 3. Attribution du rôle via 'role_user'
            // On récupère d'abord l'ID du rôle à partir de son code (enum)
            const roleSql = `SELECT id FROM roles WHERE code = $1`;
            const roleParams = [role]
            const roleResult = await client.query(roleSql, roleParams);

            if (roleResult.rows.length > 0) {
                const roleId = roleResult.rows[0].id;
                const roleUserSql = `INSERT INTO role_user (user_id, role_id) VALUES ($1, $2)`;
                const roleUserParams = [dto.id, roleId]
                await client.query(roleUserSql, roleUserParams);
            } else {
                // Le rôle n'existe pas en base — on rejette explicitement la transaction
                await client.query('ROLLBACK');
                this.logger.error(`Role assignment failed: role code '${role}' not found in roles table.`);
                throw new BadRequestError(`Le rôle '${role}' n'existe pas dans le système. Vérifiez la configuration des rôles.`);
            }

            // 4. Initialisation des préférences par défaut
            const prefSql = `INSERT INTO user_preferences (user_id) VALUES ($1)`;
            const prefParams = [dto.id]
            await client.query(prefSql, prefParams);

            // 5. Log du statut initial dans l'historique
            const historySql = `
                INSERT INTO user_status_history (user_id, new_status, reason) 
                VALUES ($1, $2, $3)`;
            const historyParams = [
                dto.id,
                dto.status || UserStatus.PENDING,
                'Initial account creation'
            ]
            await client.query(historySql, historyParams);

            await client.query('COMMIT');

            return {
                ...createdUser,
                roles: [role],
                credentials: { ...credentials }
            } as AuthUser;

        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error creating user in transaction:', error);
            throw new BadRequestError('Failed to create user account');
        } finally {
            client.release();
        }
    }

    /**
     * Recherche un utilisateur par son email ou son téléphone avec ses identifiants et rôles.
     */
    public async getUserWithCredentialsByIdentifier(identifier: string): Promise<AuthUser | null> {
        try {
            const sql = `
                SELECT 
                    u.id, u.organization_id as "organizationId",
                    u.region_id as "regionId", u.municipality_id as "municipalityId",
                    u.district_id as "districtId", u.neighborhood_id as "neighborhoodId",
                    u.department, u.created_by as "createdBy",
                    u.first_name as "firstName", u.last_name as "lastName", u.email, u.phone, 
                    u.type, u.status, u.created_at as "createdAt", u.updated_at as "updatedAt",
                    c.password_hash as "passwordHash", c.id as "creId",
                    array_agg(r.code) as roles,
                    p.photo_url as "photoUrl", p.language, p.theme, p.notifications_enabled as "notificationsEnabled", p.last_login_at as "lastLoginAt"
                FROM users u
                LEFT JOIN credentials c ON u.id = c.user_id
                LEFT JOIN role_user ru ON u.id = ru.user_id
                LEFT JOIN roles r ON ru.role_id = r.id
                LEFT JOIN user_preferences p ON u.id = p.user_id
                WHERE (u.id::text = $1 OR LOWER(u.email) = LOWER($1) OR u.phone = $1) AND u.deleted_at IS NULL
                GROUP BY u.id, c.id, p.id
            `;
            const result = await this.db.query(sql, [identifier]);
            if (result.rows.length === 0) return null;

            const row = result.rows[0];
            return {
                id: row.id,
                organizationId: row.organizationId,
                regionId: row.regionId,
                municipalityId: row.municipalityId,
                districtId: row.districtId,
                neighborhoodId: row.neighborhoodId,
                department: row.department,
                createdBy: row.createdBy,
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                phone: row.phone,
                type: row.type,
                status: row.status,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                roles: row.roles || [],
                preferences: {
                    photoUrl: row.photoUrl,
                    language: row.language,
                    theme: row.theme,
                    notificationsEnabled: row.notificationsEnabled,
                    lastLoginAt: row.lastLoginAt
                },
                credentials: {
                    id: row.creId,
                    userId: row.id,
                    passwordHash: row.passwordHash,
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt
                }
            } as AuthUser;
        } catch (error) {
            this.logger.error('Error fetching user with credentials:', error);
            throw new BadRequestError('Failed to fetch user credentials');
        }
    }

    /**
     * Crée une nouvelle session utilisateur.
     */
    public async createSession(userId: string, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string): Promise<void> {
        try {
            const sql = `
                INSERT INTO user_sessions (user_id, token, expires_at, ip_address, user_agent) 
                VALUES ($1, $2, $3, $4, $5)`;
            await this.db.query(sql, [userId, token, expiresAt, ipAddress, userAgent]);
        } catch (error) {
            this.logger.error('Error creating session:', error);
            throw new BadRequestError('Failed to create session');
        }
    }

    /**
     * Met à jour la date de dernière connexion dans les préférences.
     */
    public async updateLastLogin(userId: string): Promise<void> {
        try {
            const sql = `UPDATE user_preferences SET last_login_at = NOW() WHERE user_id = $1`;
            await this.db.query(sql, [userId]);
        } catch (error) {
            this.logger.error('Error updating last login:', error);
        }
    }
    /**
     * Récupère une session par son token de rafraîchissement.
     */
    public async getSessionByToken(token: string): Promise<any> {
        try {
            const sql = `SELECT * FROM user_sessions WHERE token = $1 AND expires_at > NOW()`;
            const result = await this.db.query(sql, [token]);
            return result.rows[0];
        } catch (error) {
            this.logger.error('Error fetching session by token:', error);
            throw new BadRequestError('Session non trouvée ou expirée');
        }
    }

    /**
     * Supprime une session spécifique (Logout).
     */
    public async deleteSession(token: string): Promise<void> {
        try {
            const sql = `DELETE FROM user_sessions WHERE token = $1`;
            await this.db.query(sql, [token]);
        } catch (error) {
            this.logger.error('Error deleting session:', error);
            throw new BadRequestError('Erreur lors de la déconnexion');
        }
    }

    /**
     * Supprime toutes les sessions d'un utilisateur (Security reset).
     */
    public async deleteUserSessions(userId: string): Promise<void> {
        try {
            const sql = `DELETE FROM user_sessions WHERE user_id = $1`;
            await this.db.query(sql, [userId]);
        } catch (error) {
            this.logger.error('Error deleting user sessions:', error);
            throw new BadRequestError('Erreur lors de la réinitialisation des sessions');
        }
    }

    /**
     * Vérifie le compte utilisateur via OTP et l'active.
     */
    public async verifyUserAccount(emailStr: string, code: string): Promise<{ id: string, email: string, firstName: string } | null> {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');

            // Note: Normalement le code devrait être haché. Si on utilise du texte clair pour le moment:
            const checkOtpSql = `
                SELECT u.id, o.id as otp_id, u.email, u.first_name as "firstName"
                FROM user_otps o
                INNER JOIN users u ON o.user_id = u.id
                WHERE lower(u.email) = lower($1)
                  AND o.code_hash = $2
                  AND o.expires_at > NOW()
                  AND o.verified = false
                  AND o.otp_type IN ('account_activation', 'account_setup_otp')
                  AND u.status = 'pending'`;

            // On suppose ici que 'code' est déjà haché ou comparé proprement. 
            // Pour cet exemple, on compare le hash direct.
            const result = await client.query(checkOtpSql, [emailStr, code]);
            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            const { id: userId, otp_id: otpId, email, firstName } = result.rows[0];

            // Update status to active
            await client.query(`UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1`, [userId]);

            // ✅ Marquer UNIQUEMENT l'OTP utilisé comme vérifié (pas le password_setup_token !)
            await client.query(`UPDATE user_otps SET verified = true, verified_at = NOW() WHERE id = $1`, [otpId]);

            await client.query('COMMIT');
            return { id: userId, email, firstName };
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error verifying user account:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Sauvegarde un code OTP pour un utilisateur.
     */
    public async saveOtpCode(userId: string, codeHash: string, otpType: string, expiresAt: Date): Promise<void> {
        try {
            const sql = `
                INSERT INTO user_otps (id, user_id, code_hash, otp_type, expires_at) 
                VALUES ($1, $2, $3, $4, $5)`;
            await this.db.query(sql, [crypto.randomUUID(), userId, codeHash, otpType, expiresAt]);
        } catch (error) {
            this.logger.error('Error saving OTP code:', error);
            throw new BadRequestError('Failed to save verification code');
        }
    }

    public async getUserByEmail(email: string): Promise<User | null> {
        try {
            const sql = `
                SELECT id, first_name as "firstName", last_name as "lastName", email, phone, type, status, created_at as "createdAt" 
                FROM users 
                WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL`;
            const result = await this.db.query(sql, [email]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            this.logger.error('Error fetching user by email:', error);
            throw new BadRequestError('Failed to fetch user by email');
        }
    }
    /**
     * Met à jour le statut d'un utilisateur et log le changement dans l'historique.
     */
    public async updateUserStatus(userId: string, newStatus: UserStatus, changedBy: string, reason?: string): Promise<void> {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Récupérer l'ancien statut
            const oldStatusSql = `SELECT status FROM users WHERE id = $1`;
            const oldStatusResult = await client.query(oldStatusSql, [userId]);
            const oldStatus = oldStatusResult.rows[0]?.status;

            // 2. Mettre à jour l'utilisateur
            const updateSql = `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2`;
            await client.query(updateSql, [newStatus, userId]);

            // 3. Ajouter à l'historique
            const historySql = `
                INSERT INTO user_status_history (user_id, old_status, new_status, reason, changed_by) 
                VALUES ($1, $2, $3, $4, $5)`;
            await client.query(historySql, [userId, oldStatus, newStatus, reason, changedBy]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error updating user status:', error);
            throw new BadRequestError('Failed to update user status');
        } finally {
            client.release();
        }
    }

    /**
     * Récupère les préférences d'un utilisateur.
     */
    public async getUserPreferences(userId: string): Promise<any> {
        try {
            const sql = `SELECT * FROM user_preferences WHERE user_id = $1`;
            const result = await this.db.query(sql, [userId]);
            return result.rows[0];
        } catch (error) {
            this.logger.error('Error fetching user preferences:', error);
            throw new BadRequestError('Failed to fetch user preferences');
        }
    }

    /**
     * Crée une entrée dans les journaux d'audit.
     */
    public async createAuditLog(log: {
        userId?: string,
        action: string,
        entityName: string,
        entityId?: string,
        oldValues?: any,
        newValues?: any,
        ipAddress?: string
    }): Promise<void> {
        try {
            const sql = `
                INSERT INTO audit_logs (user_id, action, entity_name, entity_id, old_values, new_values, ip_address) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)`;
            await this.db.query(sql, [
                log.userId, log.action, log.entityName, log.entityId,
                log.oldValues ? JSON.stringify(log.oldValues) : null,
                log.newValues ? JSON.stringify(log.newValues) : null,
                log.ipAddress
            ]);
        } catch (error) {
            this.logger.error('Error creating audit log:', error);
            // On ne throw pas forcément ici pour ne pas bloquer l'action principale si l'audit échoue
        }
    }
}