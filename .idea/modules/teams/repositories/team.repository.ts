import type { Logger } from 'winston';
import crypto from 'crypto';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { BadRequestError, NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { Team, TeamWithMembers, StaffTransfer, AttendanceLog } from '../types/teams.types';

export class TeamRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) {}

    public async findByOrganization(orgId: string): Promise<Team[]> {
        const sql = `
            SELECT t.*, COUNT(tm.user_id)::int as members_count 
            FROM field_teams t
            LEFT JOIN team_members tm ON t.id = tm.team_id
            WHERE t.organization_id = $1 AND t.status != 'disabled'
            GROUP BY t.id 
            ORDER BY t.name ASC`;
        try {
            const result = await this.db.query(sql, [orgId]);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching teams:', error);
            throw new BadRequestError('Erreur lors de la récupération des équipes');
        }
    }

    public async findPaginatedByOrganization(
        orgId: string,
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<{ data: Team[], total: number }> {
        const offset = (page - 1) * limit;
        let whereClause = `WHERE t.organization_id = $1 AND t.status != 'disabled'`;
        const params: any[] = [orgId];

        if (search) {
            whereClause += ` AND t.name ILIKE $2`;
            params.push(`%${search}%`);
        }

        const sql = `
            SELECT t.*, COUNT(tm.user_id)::int as members_count 
            FROM field_teams t
            LEFT JOIN team_members tm ON t.id = tm.team_id
            ${whereClause}
            GROUP BY t.id 
            ORDER BY t.name ASC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        
        const countSql = `
            SELECT COUNT(*)::int as total
            FROM field_teams t
            ${whereClause}`;

        try {
            const countResult = await this.db.query(countSql, params);
            const total = countResult.rows[0]?.total || 0;

            const finalParams = [...params, limit, offset];
            const result = await this.db.query(sql, finalParams);
            
            return { data: result.rows, total };
        } catch (error) {
            this.logger.error('Error fetching paginated teams:', error);
            throw new BadRequestError('Erreur lors de la récupération des équipes avec pagination');
        }
    }

    /**
     * Retourne la dernière position GPS connue pour chaque brigade active.
     * Utilise DISTINCT ON pour ne garder qu'une ligne par brigade (la plus récente).
     */
    public async getLatestTeamLocations(): Promise<Array<{
        team_id: string;
        team_name: string;
        team_status: string;
        user_id: string;
        check_in_time: Date;
        latitude: number;
        longitude: number;
    }>> {
        const sql = `
            SELECT DISTINCT ON (al.team_id)
                al.team_id,
                ft.name AS team_name,
                ft.status AS team_status,
                al.user_id,
                al.check_in_time,
                ST_Y(al.location::geometry) AS latitude,
                ST_X(al.location::geometry) AS longitude
            FROM attendance_logs al
            INNER JOIN field_teams ft ON ft.id = al.team_id
            WHERE al.location IS NOT NULL
              AND ft.status != 'disabled'
            ORDER BY al.team_id, al.check_in_time DESC`;
        try {
            const result = await this.db.query(sql, []);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching team locations:', error);
            throw new BadRequestError('Erreur lors de la récupération des positions des brigades');
        }
    }

    public async createTeam(data: { 
        name: string, 
        organizationId: string, 
        municipalityId?: string,
        teamType?: string,
        description?: string 
    }): Promise<Team> {
        const sql = `
            INSERT INTO field_teams (id, name, organization_id, municipality_id, team_type, description, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'active')
            RETURNING *`;
        
        const params = [
            crypto.randomUUID(),
            data.name,
            data.organizationId,
            data.municipalityId,
            data.teamType,
            data.description
        ];

        try {
            const result = await this.db.query(sql, params);
            return result.rows[0];
        } catch (error) {
            this.logger.error('Error creating team:', error);
            throw new BadRequestError('Impossible de créer la brigade');
        }
    }

    public async addMember(teamId: string, userId: string, role: string = 'member'): Promise<void> {
        // Upsert: if the user is already in this team (left_at IS NULL), do nothing.
        const sql = `
            INSERT INTO team_members (id, team_id, user_id, role_in_team, joined_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (team_id, user_id) DO NOTHING`;
        try {
            await this.db.query(sql, [crypto.randomUUID(), teamId, userId, role]);
        } catch (error) {
            this.logger.error('Error adding team member:', error);
            throw new BadRequestError('Échec de l\'ajout du membre à l\'équipe');
        }
    }

    /**
     * Retourne la liste des membres actuels (non sortants) d'une équipe,
     * avec les informations de base de l'utilisateur.
     */
    public async getTeamMembers(teamId: string): Promise<Array<{
        user_id: string;
        first_name: string;
        last_name: string;
        email: string;
        role_in_team: string;
        joined_at: Date;
    }>> {
        const sql = `
            SELECT 
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.email,
                COALESCE(tm.role_in_team, 'member') AS role_in_team,
                tm.joined_at
            FROM team_members tm
            INNER JOIN users u ON u.id = tm.user_id
            WHERE tm.team_id = $1 AND tm.left_at IS NULL
            ORDER BY tm.joined_at ASC`;
        try {
            const result = await this.db.query(sql, [teamId]);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching team members:', error);
            throw new BadRequestError('Erreur lors de la récupération des membres');
        }
    }

    /**
     * Retire un utilisateur d'une équipe (soft-delete via left_at).
     */
    public async removeMember(teamId: string, userId: string): Promise<void> {
        const sql = `
            UPDATE team_members SET left_at = NOW()
            WHERE team_id = $1 AND user_id = $2 AND left_at IS NULL`;
        try {
            await this.db.query(sql, [teamId, userId]);
        } catch (error) {
            this.logger.error('Error removing team member:', error);
            throw new BadRequestError('Échec du retrait du membre');
        }
    }

    /**
     * Enregistre un transfert de brigade avec historique
     */
    public async transferMember(transfer: Partial<StaffTransfer>): Promise<void> {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            
            // 1. Marquer la sortie de l'ancienne équipe
            await client.query(
                `UPDATE team_members SET left_at = NOW() WHERE user_id = $1 AND team_id = $2 AND left_at IS NULL`,
                [transfer.user_id, transfer.old_team_id]
            );

            // 2. Créer l'entrée dans la nouvelle équipe
            await client.query(
                `INSERT INTO team_members (id, team_id, user_id, joined_at) VALUES ($1, $2, $3, NOW())`,
                [crypto.randomUUID(), transfer.new_team_id, transfer.user_id]
            );

            // 3. Loguer le transfert
            await client.query(
                `INSERT INTO staff_transfers (id, user_id, old_team_id, new_team_id, transferred_by, reason) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [crypto.randomUUID(), transfer.user_id, transfer.old_team_id, transfer.new_team_id, transfer.transferred_by, transfer.reason]
            );

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error during staff transfer:', error);
            throw new BadRequestError('Échec du transfert de l\'agent');
        } finally {
            client.release();
        }
    }

    public async logAttendance(log: { 
        user_id: string; 
        team_id: string; 
        latitude: number; 
        longitude: number 
    }): Promise<void> {
        const sql = `
            INSERT INTO attendance_logs (id, user_id, team_id, check_in_time, location) 
            VALUES ($1, $2, $3, NOW(), ST_SetSRID(ST_Point($4, $5), 4326))`;
        await this.db.query(sql, [crypto.randomUUID(), log.user_id, log.team_id, log.longitude, log.latitude]);
    }

    public async updateTeam(id: string, data: any): Promise<Team> {
        const entries = Object.entries(data).filter(([_, v]) => v !== undefined);
        if (entries.length === 0) throw new BadRequestError('Aucune donnée à mettre à jour');

        // Mapping camelCase -> snake_case pour SQL
        const setClause = entries
            .map(([key], index) => `${key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)} = $${index + 2}`)
            .join(', ');
        
        const values = entries.map(([_, v]) => v);

        const sql = `
            UPDATE field_teams 
            SET ${setClause}, updated_at = NOW() 
            WHERE id = $1 AND status != 'disabled'
            RETURNING *`;

        try {
            const result = await this.db.query(sql, [id, ...values]);
            if (result.rows.length === 0) throw new NotFoundError('Brigade non trouvée ou inactive');
            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error('Error updating team:', error);
            throw new BadRequestError('Impossible de mettre à jour la brigade');
        }
    }

    public async deleteTeam(id: string): Promise<void> {
        const sql = `UPDATE field_teams SET status = 'disabled', updated_at = NOW() WHERE id = $1`;
        try {
            const result = await this.db.query(sql, [id]);
            if (result.rowCount === 0) throw new NotFoundError('Brigade non trouvée');
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error('Error deleting team:', error);
            throw new BadRequestError('Impossible de supprimer la brigade');
        }
    }
}