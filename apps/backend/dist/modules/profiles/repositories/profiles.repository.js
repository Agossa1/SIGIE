"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesRepository = void 0;
class ProfilesRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getProfile(userId) {
        const result = await this.db.query(`SELECT * FROM user_profiles WHERE user_id = $1`, [userId]);
        return result.rows[0] || null;
    }
    async upsertProfile(userId, data) {
        const result = await this.db.query(`
            INSERT INTO user_profiles (id, user_id, language, theme, notifications, photo_url, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                language = COALESCE($2, user_profiles.language),
                theme = COALESCE($3, user_profiles.theme),
                notifications = COALESCE($4, user_profiles.notifications),
                photo_url = COALESCE($5, user_profiles.photo_url),
                updated_at = NOW()
            RETURNING *`, [userId, data.language || null, data.theme || null, data.notifications ?? null, data.photoUrl || null]);
        return result.rows[0];
    }
}
exports.ProfilesRepository = ProfilesRepository;
//# sourceMappingURL=profiles.repository.js.map