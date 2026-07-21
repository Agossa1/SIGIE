"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class ProfileRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getProfile(userId) {
        const sql = `
            SELECT 
                u.id, u.first_name as "firstName", u.last_name as "lastName", 
                u.email, u.phone, u.organization_id as "organizationId", 
                u.municipality_id as "municipalityId",
                p.photo_url as "photoUrl", p.language, p.theme, 
                p.notifications_enabled as "notificationsEnabled"
            FROM users u
            LEFT JOIN user_preferences p ON u.id = p.user_id
            WHERE u.id = $1 AND u.deleted_at IS NULL`;
        try {
            const result = await this.db.query(sql, [userId]);
            if (result.rows.length === 0)
                throw new appErrors_1.NotFoundError('Profil utilisateur non trouvé');
            return result.rows[0];
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error('Error fetching profile:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la récupération du profil');
        }
    }
    async updateProfile(userId, data) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            if (data.firstName || data.lastName || data.phone) {
                const userSql = `
                    UPDATE users 
                    SET first_name = COALESCE($1, first_name), 
                        last_name = COALESCE($2, last_name), 
                        phone = COALESCE($3, phone),
                        updated_at = NOW() 
                    WHERE id = $4`;
                await client.query(userSql, [data.firstName, data.lastName, data.phone, userId]);
            }
            const prefSql = `
                UPDATE user_preferences 
                SET language = COALESCE($1, language), 
                    theme = COALESCE($2, theme), 
                    notifications_enabled = COALESCE($3, notifications_enabled)
                WHERE user_id = $4`;
            await client.query(prefSql, [data.language, data.theme, data.notificationsEnabled, userId]);
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error updating profile:', error);
            throw new appErrors_1.BadRequestError('Échec de la mise à jour du profil');
        }
        finally {
            client.release();
        }
    }
}
exports.ProfileRepository = ProfileRepository;
//# sourceMappingURL=profile.repository.js.map