import PostgresDatabase from '../../../infra/database/postgres';
import type { Logger } from 'winston';
import type { UserProfile } from '../types/profiles.types';

export class ProfilesRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger,
    ) {}

    async getProfile(userId: string): Promise<UserProfile | null> {
        const result = await this.db.query(
            `SELECT * FROM user_profiles WHERE user_id = $1`, [userId]
        );
        return result.rows[0] || null;
    }

    async upsertProfile(userId: string, data: {
        language?: string; theme?: string; notifications?: boolean; photoUrl?: string;
    }): Promise<UserProfile> {
        const result = await this.db.query(`
            INSERT INTO user_profiles (id, user_id, language, theme, notifications, photo_url, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                language = COALESCE($2, user_profiles.language),
                theme = COALESCE($3, user_profiles.theme),
                notifications = COALESCE($4, user_profiles.notifications),
                photo_url = COALESCE($5, user_profiles.photo_url),
                updated_at = NOW()
            RETURNING *`,
            [userId, data.language || null, data.theme || null, data.notifications ?? null, data.photoUrl || null]
        );
        return result.rows[0];
    }
}