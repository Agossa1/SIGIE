"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionsRepository = void 0;
const missions_types_1 = require("../types/missions.types");
const appErrors_1 = require("../../../shared/errors/appErrors");
class MissionsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getUserTeamId(userId) {
        try {
            const result = await this.db.query(`SELECT team_id FROM team_members WHERE user_id = $1`, [userId]);
            return result.rowCount > 0 ? result.rows[0].team_id : null;
        }
        catch (error) {
            this.logger.error('Error fetching user team:', error);
            return null;
        }
    }
    async createMission(dto) {
        try {
            const initialStatus = dto.assignedTeamId ? missions_types_1.MissionStatus.ASSIGNED : missions_types_1.MissionStatus.DRAFT;
            let sql = `
                INSERT INTO missions (
                    title, description, mission_type, priority_level, 
                    municipality_id, assigned_team_id, scheduled_at, created_by, status,
                    report_id, due_date, estimated_hours
            `;
            const params = [
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
            }
            else {
                sql += `) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`;
            }
            const result = await this.db.query(sql, params);
            return result.rows[0].id;
        }
        catch (error) {
            this.logger.error('Error creating mission:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la création de la mission');
        }
    }
    async getMissions(teamId) {
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
            const params = [];
            if (teamId) {
                sql += ` WHERE m.assigned_team_id = $1`;
                params.push(teamId);
            }
            sql += ` ORDER BY m.created_at DESC`;
            const result = await this.db.query(sql, params);
            return result.rows;
        }
        catch (error) {
            this.logger.error('Error fetching missions:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la récupération des missions');
        }
    }
    /**
     * Version paginée avec filtres territoriaux et recherche.
     */
    async getMissionsPaginated(teamId, filters = {}, page = 1, limit = 20) {
        try {
            const conditions = [];
            const params = [];
            let paramIdx = 1;
            const addFilter = (col, value) => {
                if (value !== undefined && value !== null && value !== '') {
                    conditions.push(`${col} = $${paramIdx++}`);
                    params.push(value);
                }
            };
            if (teamId) {
                conditions.push(`m.assigned_team_id = $${paramIdx++}`);
                params.push(teamId);
            }
            addFilter('m.municipality_id', filters.municipalityId);
            addFilter('m.status', filters.status);
            addFilter('m.mission_type', filters.missionType);
            addFilter('m.created_by', filters.createdBy);
            // Recherche textuelle
            if (filters.search) {
                conditions.push(`(m.title ILIKE $${paramIdx} OR m.description ILIKE $${paramIdx})`);
                params.push(`%${filters.search}%`);
                paramIdx++;
            }
            // Filtre région via JOIN
            if (filters.regionId) {
                conditions.push(`mun.region_id = $${paramIdx++}`);
                params.push(filters.regionId);
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const offset = (page - 1) * limit;
            const baseSelect = `
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
            // Count
            const countResult = await this.db.query(`SELECT count(*) FROM missions m LEFT JOIN municipalities mun ON m.municipality_id = mun.id ${whereClause}`, params);
            const total = parseInt(countResult.rows[0].count, 10);
            // Query paginée
            const querySql = `${baseSelect} ${whereClause} ORDER BY m.created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
            params.push(limit, offset);
            const result = await this.db.query(querySql, params);
            return {
                data: result.rows,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            this.logger.error('Error fetching missions paginated:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la récupération des missions');
        }
    }
    async checkTeamExists(teamId) {
        try {
            const sql = `SELECT * FROM field_teams WHERE id = $1`;
            const result = await this.db.query(sql, [teamId]);
            return result.rowCount > 0;
        }
        catch (error) {
            this.logger.error('Error checking team existence:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la vérification de l\'existence de l\'équipe');
        }
    }
    async updateMissionStatus(id, status, changedBy) {
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
        }
        catch (error) {
            this.logger.error('Error updating mission status:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la mise à jour du statut');
        }
    }
    async getMissionById(id) {
        try {
            // Requête 1 : Mission + jointures principales
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
            if (missionResult.rowCount === 0)
                return null;
            const mission = missionResult.rows[0];
            // Requête 2 : Toutes les données liées en parallèle (assignments, reports, logs, checklist)
            const [assignmentsResult, reportsResult, logsResult, checklistResult] = await Promise.all([
                this.db.query(`SELECT id, mission_id as "missionId", user_id as "userId", assigned_at as "assignedAt" FROM mission_assignments WHERE mission_id = $1`, [id]),
                this.db.query(`SELECT id, mission_id as "missionId", submitted_by as "submittedBy", report, completion_percentage as "completionPercentage", created_at as "createdAt" FROM mission_reports WHERE mission_id = $1`, [id]),
                this.db.query(`SELECT id, mission_id as "missionId", old_status as "oldStatus", new_status as "newStatus", changed_by as "changedBy", created_at as "createdAt" FROM mission_status_logs WHERE mission_id = $1 ORDER BY created_at DESC`, [id]),
                this.db.query(`SELECT id, mission_id as "missionId", label, done, done_by as "doneBy", done_at as "doneAt", created_at as "createdAt", "order" FROM mission_checklist WHERE mission_id = $1 ORDER BY "order" ASC`, [id]),
            ]);
            return {
                ...mission,
                assignments: assignmentsResult.rows,
                reports: reportsResult.rows,
                statusLogs: logsResult.rows,
                checklist: checklistResult.rows
            };
        }
        catch (error) {
            this.logger.error('Error fetching mission by id:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la récupération de la mission');
        }
    }
    async updateMission(id, dto) {
        try {
            const updates = [];
            const params = [];
            let paramIndex = 1;
            if (dto.title !== undefined) {
                updates.push(`title = $${paramIndex++}`);
                params.push(dto.title);
            }
            if (dto.description !== undefined) {
                updates.push(`description = $${paramIndex++}`);
                params.push(dto.description);
            }
            if (dto.missionType !== undefined) {
                updates.push(`mission_type = $${paramIndex++}`);
                params.push(dto.missionType);
            }
            if (dto.priorityLevel !== undefined) {
                updates.push(`priority_level = $${paramIndex++}`);
                params.push(dto.priorityLevel);
            }
            if (dto.municipalityId !== undefined) {
                updates.push(`municipality_id = $${paramIndex++}`);
                params.push(dto.municipalityId);
            }
            if (dto.assignedTeamId !== undefined) {
                updates.push(`assigned_team_id = $${paramIndex++}`);
                params.push(dto.assignedTeamId);
            }
            if (dto.scheduledAt !== undefined) {
                updates.push(`scheduled_at = $${paramIndex++}`);
                params.push(dto.scheduledAt);
            }
            if (updates.length === 0)
                return;
            params.push(id);
            const sql = `UPDATE missions SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
            await this.db.query(sql, params);
        }
        catch (error) {
            this.logger.error('Error updating mission:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la mise à jour de la mission');
        }
    }
    async assignUsersToMission(missionId, userIds) {
        try {
            await this.db.query('BEGIN');
            for (const userId of userIds) {
                await this.db.query('INSERT INTO mission_assignments (mission_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [missionId, userId]);
            }
            await this.db.query('COMMIT');
        }
        catch (error) {
            await this.db.query('ROLLBACK');
            this.logger.error('Error assigning users:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de l\'assignation des utilisateurs');
        }
    }
    /**
     * Résout le signalement lié quand une mission est terminée/validée.
     * DÉPLACÉ du service pour respecter le pattern : SQL uniquement dans le repository.
     */
    async resolveLinkedReport(reportId) {
        try {
            await this.db.query(`UPDATE technician_reports SET status = 'resolved', updated_at = NOW() WHERE id = $1 AND status != 'resolved'`, [reportId]);
        }
        catch (error) {
            this.logger.error('Error resolving linked report:', error);
        }
    }
    async createMissionReport(missionId, userId, dto) {
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
        }
        catch (error) {
            this.logger.error('Error adding mission report:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de l\'ajout du rapport de mission');
        }
    }
    async hasActiveInterventions(missionId) {
        try {
            const result = await this.db.query(`SELECT 1 FROM interventions WHERE mission_id = $1 AND status = 'in_progress' AND deleted_at IS NULL LIMIT 1`, [missionId]);
            return result.rowCount > 0;
        }
        catch (error) {
            this.logger.error('Error checking active interventions:', error);
            return false; // Default to false if error, to not block unexpectedly, or could throw.
        }
    }
    async completeAllActiveInterventions(missionId) {
        try {
            await this.db.query(`UPDATE interventions 
                 SET status = 'completed', ended_at = NOW() 
                 WHERE mission_id = $1 AND status = 'in_progress' AND deleted_at IS NULL`, [missionId]);
        }
        catch (error) {
            this.logger.error('Error completing active interventions:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la clôture des interventions');
        }
    }
}
exports.MissionsRepository = MissionsRepository;
//# sourceMappingURL=missions.repository.js.map