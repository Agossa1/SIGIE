"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UsersRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async findAll() {
        try {
            const sql = `
                SELECT 
                    u.id,
                    u.first_name as "firstName",
                    u.last_name as "lastName",
                    u.email,
                    u.phone,
                    u.status,
                    u.type,
                    u.created_at as "createdAt",
                    u.updated_at as "updatedAt",
                    COALESCE(array_agg(DISTINCT r.code) FILTER (WHERE r.code IS NOT NULL), '{}') as roles,
                    ft.id as "teamId",
                    ft.name as "teamName"
                FROM users u
                LEFT JOIN role_user ru ON u.id = ru.user_id
                LEFT JOIN roles r ON ru.role_id = r.id
                LEFT JOIN team_members tm ON u.id = tm.user_id AND tm.left_at IS NULL
                LEFT JOIN field_teams ft ON tm.team_id = ft.id
                WHERE u.deleted_at IS NULL
                GROUP BY u.id, ft.id, ft.name
                ORDER BY u.created_at DESC
            `;
            const result = await this.db.query(sql);
            return result.rows;
        }
        catch (error) {
            this.logger.error('Error fetching all users:', error);
            throw new appErrors_1.BadRequestError('Failed to fetch users');
        }
    }
    async findById(id) {
        try {
            const sql = `
                SELECT 
                    u.id,
                    u.first_name as "firstName",
                    u.last_name as "lastName",
                    u.email,
                    u.phone,
                    u.status,
                    u.type,
                    u.created_at as "createdAt",
                    u.updated_at as "updatedAt",
                    COALESCE(array_agg(DISTINCT r.code) FILTER (WHERE r.code IS NOT NULL), '{}') as roles,
                    ft.id as "teamId",
                    ft.name as "teamName"
                FROM users u
                LEFT JOIN role_user ru ON u.id = ru.user_id
                LEFT JOIN roles r ON ru.role_id = r.id
                LEFT JOIN team_members tm ON u.id = tm.user_id AND tm.left_at IS NULL
                LEFT JOIN field_teams ft ON tm.team_id = ft.id
                WHERE u.id = $1 AND u.deleted_at IS NULL
                GROUP BY u.id, ft.id, ft.name
            `;
            const result = await this.db.query(sql, [id]);
            return result.rows[0] || null;
        }
        catch (error) {
            this.logger.error(`Error fetching user by id ${id}:`, error);
            throw new appErrors_1.BadRequestError('Failed to fetch user');
        }
    }
    async update(id, data) {
        try {
            const sets = [];
            const values = [];
            let i = 1;
            if (data.firstName !== undefined) {
                sets.push(`first_name = $${i++}`);
                values.push(data.firstName);
            }
            if (data.lastName !== undefined) {
                sets.push(`last_name = $${i++}`);
                values.push(data.lastName);
            }
            if (data.phone !== undefined) {
                sets.push(`phone = $${i++}`);
                values.push(data.phone);
            }
            if (sets.length === 0)
                return await this.findById(id);
            values.push(id);
            const sql = `
                UPDATE users 
                SET ${sets.join(', ')}, updated_at = NOW()
                WHERE id = $${i}
                RETURNING id
            `;
            await this.db.query(sql, values);
            return await this.findById(id);
        }
        catch (error) {
            this.logger.error(`Error updating user ${id}:`, error);
            throw new appErrors_1.BadRequestError('Failed to update user');
        }
    }
    async assignRole(userId, roleName) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            // Trouver l'ID du rôle à partir de son code
            const roleResult = await client.query(`SELECT id FROM roles WHERE code = $1`, [roleName]);
            if (roleResult.rows.length === 0) {
                throw new appErrors_1.BadRequestError(`Rôle introuvable : ${roleName}`);
            }
            const roleId = roleResult.rows[0].id;
            // Supprimer les anciens rôles de l'utilisateur
            await client.query(`DELETE FROM role_user WHERE user_id = $1`, [userId]);
            // Attribuer le nouveau rôle
            await client.query(`INSERT INTO role_user (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userId, roleId]);
            await client.query('COMMIT');
            // Retourner l'utilisateur mis à jour
            const updatedResult = await this.db.query(`SELECT 
                    u.id, u.first_name as "firstName", u.last_name as "lastName",
                    u.email, u.phone, u.status, u.type,
                    u.created_at as "createdAt", u.updated_at as "updatedAt",
                    COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), '{}') as roles
                FROM users u
                LEFT JOIN role_user ru ON u.id = ru.user_id
                LEFT JOIN roles r ON ru.role_id = r.id
                WHERE u.id = $1 AND u.deleted_at IS NULL
                GROUP BY u.id`, [userId]);
            return updatedResult.rows[0] || null;
        }
        catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error assigning role:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.UsersRepository = UsersRepository;
//# sourceMappingURL=users.repository.js.map