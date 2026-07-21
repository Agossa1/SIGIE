"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsRepository = void 0;
class TeamsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getAllTeams() {
        try {
            const result = await this.db.query(`
                SELECT
                    ft.id, ft.name, ft.status,
                    ft.municipality_id as "municipalityId",
                    mun.name as "municipalityName",
                    ft.region_id as "regionId",
                    r.name as "regionName",
                    ft.created_at as "createdAt",
                    (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = ft.id)::int as "membersCount"
                FROM field_teams ft
                LEFT JOIN municipalities mun ON ft.municipality_id = mun.id
                LEFT JOIN regions r ON ft.region_id = r.id
                ORDER BY ft.name
            `);
            return result.rows;
        }
        catch (error) {
            this.logger.error('Error fetching teams:', error);
            throw error;
        }
    }
    async getTeamMembers(teamId) {
        try {
            const result = await this.db.query(`
                SELECT
                    tm.id, tm.team_id as "teamId", tm.user_id as "userId",
                    u.first_name as "firstName", u.last_name as "lastName",
                    u.email, u.phone, tm.joined_at as "joinedAt"
                FROM team_members tm
                JOIN users u ON tm.user_id = u.id
                WHERE tm.team_id = $1
                ORDER BY u.first_name
            `, [teamId]);
            return result.rows;
        }
        catch (error) {
            this.logger.error('Error fetching team members:', error);
            throw error;
        }
    }
}
exports.TeamsRepository = TeamsRepository;
//# sourceMappingURL=teams.repository.js.map