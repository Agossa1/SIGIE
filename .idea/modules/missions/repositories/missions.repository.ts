import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { CreateMissionDTO, Mission, MissionStatus, UpdateMissionDTO, MissionDetails, MissionAssignment, MissionReport, MissionStatusLog, CreateMissionReportDTO } from '../types/missions.types';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import type { Logger } from 'winston';

export class MissionsRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) {}

    async getUserTeamId(userId: string): Promise<string | null> {
        try {
            const result = await this.db.query(
                `SELECT team_id FROM team_members WHERE user_id = $1`,
                [userId]
            );
            return result.rowCount > 0 ? result.rows[0].team_id : null;
        } catch (error) {
            this.logger.error('Error fetching user team:', error);
            return null;
        }
    }

    async createMission(dto: CreateMissionDTO): Promise<string> {
        try {
            const initialStatus = dto.assignedTeamId ? MissionStatus.ASSIGNED : MissionStatus.DRAFT;

            let sql = `
                INSERT INTO missions (
                    title, description, mission_type, priority_level, 
                    municipality_id, assigned_team_id, scheduled_at, created_by, status,
                    report_id, due_date, estimated_hours
            `;
            const params: any[] = [
                dto.title,
                dto.description || null,
                dto.missionType,
                dto.priorityLevel,
                dto.municipalityId || null,
                dto.assignedTeamId || null,
                dto.scheduledAt || null,
                dto.createdBy,
                initialStatus,
                dto.reportId || null,
                dto.dueDate || null,
                dto.estimatedHours || null,
            ];

            if (dto.latitude !== undefined && dto.longitude !== undefined) {
                sql += `, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, ST_SetSRID(ST_MakePoint($14, $13), 4326)) RETURNING id`;
                params.push(dto.latitude, dto.longitude);
            } else {
                sql += `) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`;
            }

            const result = await this.db.query(sql, params);
            return result.rows[0].id;
        } catch (error) {
            this.logger.error('Error creating mission:', error);
            throw new BadRequestError('Erreur lors de la création de la mission');
        }
    }

    async getMissions(teamId?: string): Promise<Mission[]> {
        try {
            let sql = `
                SELECT 
                    m.id, m.title, m.description, m.mission_type as "missionType", 
                    m.priority_level as "priorityLevel", m.status, 
                    m.scheduled_at as "scheduledAt", m.completed_at as "completedAt",
                    m.created_by as "createdBy", m.created_at as "createdAt",
                    m.municipality_id as "municipalityId",
                    mun.name as "municipalityName",
                    m.assigned_team_id as "assignedTeamId",
                    ft.name as "assignedTeamName",
                    m.report_id as "reportId",
                    m.due_date as "dueDate",
                    m.estimated_hours as "estimatedHours",
                    m.actual_hours as "actualHours",
                    (m.due_date IS NOT NULL AND m.due_date < NOW() AND m.status NOT IN ('completed','validated','cancelled')) as "isOverdue",
                    ST_Y(m.location::geometry) as "latitude",
                    ST_X(m.location::geometry) as "longitude"
                FROM missions m
                LEFT JOIN municipalities mun ON m.municipality_id = mun.id
                LEFT JOIN field_teams ft ON m.assigned_team_id = ft.id
            `;
            
            const params: any[] = [];
            if (teamId) {
                sql += ` WHERE m.assigned_team_id = $1`;
                params.push(teamId);
            }
            
            sql += ` ORDER BY m.created_at DESC`;
            
            const result = await this.db.query(sql, params);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching missions:', error);
            throw new BadRequestError('Erreur lors de la récupération des missions');
        }
    }


    async checkTeamExists(teamId: string): Promise<boolean> {
        try {
            const sql = `SELECT * FROM field_teams WHERE id = $1`;
            const result = await this.db.query(sql, [teamId]);
            return result.rowCount > 0;
        } catch (error) {
            this.logger.error('Error checking team existence:', error);
            throw new BadRequestError('Erreur lors de la vérification de l\'existence de l\'équipe');
        }
    }   

    async updateMissionStatus(id: string, status: string, changedBy: string): Promise<void> {
        try {
            const sql = `
                WITH old_mission AS (
                    SELECT status FROM missions WHERE id = $2
                ), updated_mission AS (
                    UPDATE missions SET status = $1::mission_status_enum WHERE id = $2
                )
                INSERT INTO mission_status_logs (mission_id, old_status, new_status, changed_by)
                SELECT $2, status, $1::mission_status_enum, $3
                FROM old_mission
                WHERE status != $1::mission_status_enum;
            `;
            await this.db.query(sql, [status, id, changedBy]);
        } catch (error) {
            this.logger.error('Error updating mission status:', error);
            throw new BadRequestError('Erreur lors de la mise à jour du statut');
        }
    }

    async getMissionById(id: string): Promise<MissionDetails | null> {
        try {
            const missionSql = `
                SELECT 
                    m.id, m.title, m.description, m.mission_type as "missionType", 
                    m.priority_level as "priorityLevel", m.status, 
                    m.scheduled_at as "scheduledAt", m.completed_at as "completedAt",
                    m.created_by as "createdBy", m.created_at as "createdAt",
                    m.municipality_id as "municipalityId",
                    mun.name as "municipalityName",
                    m.assigned_team_id as "assignedTeamId",
                    ft.name as "assignedTeamName",
                    m.report_id as "reportId",
                    m.due_date as "dueDate",
                    m.estimated_hours as "estimatedHours",
                    m.actual_hours as "actualHours",
                    (m.due_date IS NOT NULL AND m.due_date < NOW() AND m.status NOT IN ('completed','validated','cancelled')) as "isOverdue"
                FROM missions m
                LEFT JOIN municipalities mun ON m.municipality_id = mun.id
                LEFT JOIN field_teams ft ON m.assigned_team_id = ft.id
                WHERE m.id = $1
            `;
            const missionResult = await this.db.query(missionSql, [id]);
            
            if (missionResult.rowCount === 0) return null;
            const mission = missionResult.rows[0];

            const assignmentsSql = `SELECT id, mission_id as "missionId", user_id as "userId", assigned_at as "assignedAt" FROM mission_assignments WHERE mission_id = $1`;
            const assignmentsResult = await this.db.query(assignmentsSql, [id]);

            const reportsSql = `SELECT id, mission_id as "missionId", submitted_by as "submittedBy", report, completion_percentage as "completionPercentage", created_at as "createdAt" FROM mission_reports WHERE mission_id = $1`;
            const reportsResult = await this.db.query(reportsSql, [id]);

            const logsSql = `SELECT id, mission_id as "missionId", old_status as "oldStatus", new_status as "newStatus", changed_by as "changedBy", created_at as "createdAt" FROM mission_status_logs WHERE mission_id = $1 ORDER BY created_at DESC`;
            const logsResult = await this.db.query(logsSql, [id]);

            const checklistSql = `SELECT id, mission_id as "missionId", label, done, done_by as "doneBy", done_at as "doneAt", created_at as "createdAt", "order" FROM mission_checklist WHERE mission_id = $1 ORDER BY "order" ASC`;
            const checklistResult = await this.db.query(checklistSql, [id]);

            return {
                ...mission,
                assignments: assignmentsResult.rows,
                reports: reportsResult.rows,
                statusLogs: logsResult.rows,
                checklist: checklistResult.rows
            };
        } catch (error) {
            this.logger.error('Error fetching mission by id:', error);
            throw new BadRequestError('Erreur lors de la récupération de la mission');
        }
    }

    async updateMission(id: string, dto: UpdateMissionDTO): Promise<void> {
        try {
            const updates: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (dto.title !== undefined) { updates.push(`title = $${paramIndex++}`); params.push(dto.title); }
            if (dto.description !== undefined) { updates.push(`description = $${paramIndex++}`); params.push(dto.description); }
            if (dto.missionType !== undefined) { updates.push(`mission_type = $${paramIndex++}`); params.push(dto.missionType); }
            if (dto.priorityLevel !== undefined) { updates.push(`priority_level = $${paramIndex++}`); params.push(dto.priorityLevel); }
            if (dto.municipalityId !== undefined) { updates.push(`municipality_id = $${paramIndex++}`); params.push(dto.municipalityId); }
            if (dto.assignedTeamId !== undefined) { updates.push(`assigned_team_id = $${paramIndex++}`); params.push(dto.assignedTeamId); }
            if (dto.scheduledAt !== undefined) { updates.push(`scheduled_at = $${paramIndex++}`); params.push(dto.scheduledAt); }

            if (updates.length === 0) return;

            params.push(id);
            const sql = `UPDATE missions SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
            
            await this.db.query(sql, params);
        } catch (error) {
            this.logger.error('Error updating mission:', error);
            throw new BadRequestError('Erreur lors de la mise à jour de la mission');
        }
    }

    async assignUsersToMission(missionId: string, userIds: string[]): Promise<void> {
        try {
            await this.db.query('BEGIN');
            for (const userId of userIds) {
                await this.db.query(
                    'INSERT INTO mission_assignments (mission_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [missionId, userId]
                );
            }
            await this.db.query('COMMIT');
        } catch (error) {
            await this.db.query('ROLLBACK');
            this.logger.error('Error assigning users:', error);
            throw new BadRequestError('Erreur lors de l\'assignation des utilisateurs');
        }
    }

    async createMissionReport(missionId: string, userId: string, dto: CreateMissionReportDTO): Promise<string> {
        try {
            const sql = `
                INSERT INTO mission_reports (mission_id, submitted_by, report, completion_percentage, photos)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `;
            const result = await this.db.query(sql, [
                missionId, 
                userId, 
                dto.report, 
                dto.completionPercentage || null,
                dto.photos || []
            ]);
            return result.rows[0].id;
        } catch (error) {
            this.logger.error('Error adding mission report:', error);
            throw new BadRequestError('Erreur lors de l\'ajout du rapport de mission');
        }
    }
}
