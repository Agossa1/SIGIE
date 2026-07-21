"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionsRepository = void 0;
class InterventionsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getAll(limit = 50) {
        try {
            const result = await this.db.query(`
                SELECT 
                    i.id, i.mission_id as "missionId", i.intervention_type as "interventionType",
                    i.status, i.started_at as "startedAt", i.ended_at as "endedAt",
                    i.created_at as "createdAt",
                    i.assigned_to_user_id as "userId",
                    m.title as "missionTitle"
                FROM interventions i
                LEFT JOIN missions m ON i.mission_id = m.id
                ORDER BY i.created_at DESC
                LIMIT $1
            `, [limit]);
            return result.rows;
        }
        catch (error) {
            this.logger.error('Error fetching interventions:', error);
            throw error;
        }
    }
    async getByMissionId(missionId) {
        try {
            const result = await this.db.query(`
                SELECT 
                    i.id, i.mission_id as "missionId", i.intervention_type as "interventionType",
                    i.status, i.started_at as "startedAt", i.ended_at as "endedAt",
                    i.created_at as "createdAt",
                    i.assigned_to_user_id as "userId"
                FROM interventions i
                WHERE i.mission_id = $1
                ORDER BY i.created_at DESC
            `, [missionId]);
            return result.rows;
        }
        catch (error) {
            this.logger.error('Error fetching interventions by mission:', error);
            throw error;
        }
    }
    async create(missionId, interventionType, userId) {
        try {
            const result = await this.db.query(`
                INSERT INTO interventions (id, mission_id, intervention_type, user_id, status)
                VALUES (gen_random_uuid(), $1, $2, $3, 'in_progress')
                RETURNING id, mission_id as "missionId", intervention_type as "interventionType", status, created_at as "createdAt"
            `, [missionId, interventionType, userId]);
            return result.rows[0];
        }
        catch (error) {
            this.logger.error('Error creating intervention:', error);
            throw error;
        }
    }
    async updateStatus(id, status, userId) {
        try {
            // Obtenir le statut actuel pour le log
            const currentRes = await this.db.query(`SELECT status FROM interventions WHERE id = $1`, [id]);
            const oldStatus = currentRes.rows.length > 0 ? currentRes.rows[0].status : null;
            const result = await this.db.query(`
            UPDATE interventions 
            SET 
                status = $1::field_assignment_status_enum, 
                started_at = CASE WHEN $1::field_assignment_status_enum = 'in_progress'::field_assignment_status_enum AND started_at IS NULL THEN NOW() ELSE started_at END,
                ended_at = CASE WHEN $1::field_assignment_status_enum = 'completed'::field_assignment_status_enum AND ended_at IS NULL THEN NOW() ELSE ended_at END
            WHERE id = $2
            RETURNING id, status, started_at as "startedAt", ended_at as "endedAt"
        `, [status, id]);
            const updated = result.rows.length > 0 ? result.rows[0] : null;
            // Si le statut a changé, ajouter un log automatique
            if (updated && oldStatus !== status) {
                await this.addLog({
                    interventionId: id,
                    authorId: userId,
                    logType: 'status_change',
                    oldStatus,
                    newStatus: status,
                    comment: `Statut mis à jour : ${status}`
                });
            }
            return updated;
        }
        catch (error) {
            this.logger.error('Error updating intervention status:', error);
            throw error;
        }
    }
    async addLog(data) {
        const result = await this.db.query(`
            INSERT INTO intervention_logs (intervention_id, author_id, log_type, old_status, new_status, comment)
            VALUES ($1, $2, $3::intervention_log_type, $4::field_assignment_status_enum, $5::field_assignment_status_enum, $6)
            RETURNING id, intervention_id as "interventionId", author_id as "authorId", log_type as "logType", old_status as "oldStatus", new_status as "newStatus", comment, created_at as "createdAt"
        `, [data.interventionId, data.authorId || null, data.logType, data.oldStatus || null, data.newStatus || null, data.comment || null]);
        return result.rows[0];
    }
    async getLogsByInterventionId(interventionId) {
        const result = await this.db.query(`
            SELECT l.id, l.intervention_id as "interventionId", l.author_id as "authorId",
                   l.log_type as "logType", l.old_status as "oldStatus", l.new_status as "newStatus",
                   l.comment, l.created_at as "createdAt",
                   CONCAT(u.first_name, ' ', u.last_name) as "authorName",
                   r.name as "authorRole"
            FROM intervention_logs l
            LEFT JOIN users u ON l.author_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE l.intervention_id = $1
            ORDER BY l.created_at DESC
        `, [interventionId]);
        return result.rows;
    }
    // ── Méthodes décisionnelles (Stats, Traçabilité, Export) ──────────────
    async getStats(filters) {
        const conditions = ['i.deleted_at IS NULL'];
        const params = [];
        let idx = 1;
        if (filters.municipalityId) {
            conditions.push(`m.municipality_id = $${idx++}`);
            params.push(filters.municipalityId);
        }
        if (filters.dateFrom) {
            conditions.push(`i.created_at >= $${idx++}`);
            params.push(filters.dateFrom);
        }
        if (filters.dateTo) {
            conditions.push(`i.created_at <= $${idx++}`);
            params.push(filters.dateTo);
        }
        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const statsResult = await this.db.query(`
            SELECT
                COUNT(*)::int as total,
                COUNT(*) FILTER (WHERE i.status = 'in_progress')::int as "inProgress",
                COUNT(*) FILTER (WHERE i.status = 'completed' AND i.ended_at::date = CURRENT_DATE)::int as "completedToday",
                COALESCE(AVG(EXTRACT(EPOCH FROM (i.ended_at - i.started_at)) / 3600) FILTER (WHERE i.ended_at IS NOT NULL), 0)::numeric(10,1) as "averageResolutionHours"
            FROM interventions i
            LEFT JOIN missions m ON i.mission_id = m.id
            ${where}
        `, params);
        const byTypeResult = await this.db.query(`
            SELECT i.intervention_type as type, COUNT(*)::int as count
            FROM interventions i
            LEFT JOIN missions m ON i.mission_id = m.id
            ${where}
            GROUP BY i.intervention_type ORDER BY count DESC
        `, params);
        const byMunicipalityResult = await this.db.query(`
            SELECT mun.id as "municipalityId", mun.name as "municipalityName", COUNT(*)::int as count
            FROM interventions i
            LEFT JOIN missions m ON i.mission_id = m.id
            LEFT JOIN municipalities mun ON m.municipality_id = mun.id
            ${where}
            GROUP BY mun.id, mun.name ORDER BY count DESC LIMIT 10
        `, params);
        return {
            stats: statsResult.rows[0],
            byType: byTypeResult.rows,
            byMunicipality: byMunicipalityResult.rows,
        };
    }
    async getTraceabilityByReport(reportId) {
        const reportResult = await this.db.query(`
            SELECT tr.id, tr.title, tr.issue_category as category, tr.status, tr.priority,
                   tr.reported_at as "reportedAt", mun.name as "municipalityName"
            FROM technician_reports tr
            LEFT JOIN municipalities mun ON tr.municipality_id = mun.id
            WHERE tr.id = $1 AND tr.deleted_at IS NULL
        `, [reportId]);
        const missionsResult = await this.db.query(`
            SELECT m.id, m.title, m.status, m.scheduled_at as "scheduledAt",
                   m.completed_at as "completedAt", ft.name as "teamName"
            FROM missions m
            LEFT JOIN field_teams ft ON m.assigned_team_id = ft.id
            WHERE m.report_id = $1
            ORDER BY m.created_at ASC
        `, [reportId]);
        const interventionsResult = await this.db.query(`
            SELECT i.id, i.intervention_type as type, i.status,
                   i.started_at as "startedAt", i.ended_at as "endedAt"
            FROM interventions i
            LEFT JOIN missions m ON i.mission_id = m.id
            WHERE m.report_id = $1
            ORDER BY i.created_at ASC
        `, [reportId]);
        return {
            report: reportResult.rows[0] || null,
            missions: missionsResult.rows,
            interventions: interventionsResult.rows,
        };
    }
    async exportCSV(filters) {
        const conditions = ['i.deleted_at IS NULL'];
        const params = [];
        let idx = 1;
        if (filters.municipalityId) {
            conditions.push(`m.municipality_id = $${idx++}`);
            params.push(filters.municipalityId);
        }
        if (filters.dateFrom) {
            conditions.push(`i.created_at >= $${idx++}`);
            params.push(filters.dateFrom);
        }
        if (filters.dateTo) {
            conditions.push(`i.created_at <= $${idx++}`);
            params.push(filters.dateTo);
        }
        if (filters.status) {
            conditions.push(`i.status = $${idx++}`);
            params.push(filters.status);
        }
        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const result = await this.db.query(`
            SELECT i.id, i.intervention_type as type, i.status,
                   i.started_at as "startedAt", i.ended_at as "endedAt",
                   m.title as "missionTitle",
                   mun.name as "municipalityName",
                   CONCAT(u.first_name, ' ', u.last_name) as "agentName"
            FROM interventions i
            LEFT JOIN missions m ON i.mission_id = m.id
            LEFT JOIN municipalities mun ON m.municipality_id = mun.id
            LEFT JOIN users u ON i.assigned_to_user_id = u.id
            ${where}
            ORDER BY i.created_at DESC
        `, params);
        return result.rows;
    }
}
exports.InterventionsRepository = InterventionsRepository;
//# sourceMappingURL=interventions.repository.js.map