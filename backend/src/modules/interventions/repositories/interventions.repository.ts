import PostgresDatabase from '../../../infra/database/postgres';
import {Logger} from 'winston'
import type { 
    InterventionRecord, 
    StatsRecord, 
    TypeStatRecord, 
    MunicipalityStatRecord, 
    TraceabilityReportRecord, 
    TraceabilityMissionRecord, 
    TraceabilityInterventionRecord, 
    ExportRecord 
} from '../types/interventions.types';
import { InterventionLog, CreateInterventionLogDTO } from '../types/logs.types';


export class InterventionsRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger,
    ) {}

    async getAll(limit: number = 50, filters: any = {}): Promise<InterventionRecord[]> {
        try {
            const conditions: string[] = [];
            const params: any[] = [limit];
            let paramIdx = 2;

            if (filters.municipalityId) {
                conditions.push(`m.municipality_id = $${paramIdx++}`);
                params.push(filters.municipalityId);
            }

            if (filters.regionId) {
                conditions.push(`mun.region_id = $${paramIdx++}`);
                params.push(filters.regionId);
            }

            if (filters.assignedService) {
                if (filters.assignedService === 'sgds') {
                    conditions.push(`(m.assigned_service = 'sgds' OR (m.assigned_service IS NULL AND m.mission_type IN ('waste_collection', 'sanitation', 'ecological_restoration', 'reforestation', 'biodiversity_survey')))`);
                } else if (filters.assignedService === 'dst') {
                    conditions.push(`(m.assigned_service = 'dst' OR (m.assigned_service IS NULL AND m.mission_type NOT IN ('waste_collection', 'sanitation', 'ecological_restoration', 'reforestation', 'biodiversity_survey')))`);
                }
            }

            if (filters.teamId) {
                conditions.push(`m.assigned_team_id = $${paramIdx++}`);
                params.push(filters.teamId);
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            const result = await this.db.query(`
                SELECT
                    i.id, i.mission_id as "missionId", i.intervention_type as "interventionType",
                    i.status, i.started_at as "startedAt", i.ended_at as "endedAt",
                    i.created_at as "createdAt",
                    i.assigned_to_user_id as "userId",
                    i.completion_percentage as "completionPercentage",
                    i.priority,
                    m.title as "missionTitle",
                    CONCAT(u.first_name, ' ', u.last_name) as "agentName"
                FROM interventions i
                         LEFT JOIN missions m ON i.mission_id = m.id
                         LEFT JOIN municipalities mun ON m.municipality_id = mun.id
                         LEFT JOIN users u ON i.assigned_to_user_id = u.id
                    ${whereClause}
                ORDER BY i.created_at DESC
                    LIMIT $1
            `, params);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching interventions:', error);
            throw error;
        }
    }

    async getByMissionId(missionId: string, filters: any = {}): Promise<InterventionRecord[]> {
        try {
            const conditions: string[] = ['i.mission_id = $1'];
            const params: any[] = [missionId];
            let paramIdx = 2;

            if (filters.municipalityId) {
                conditions.push(`m.municipality_id = $${paramIdx++}`);
                params.push(filters.municipalityId);
            }

            if (filters.regionId) {
                conditions.push(`mun.region_id = $${paramIdx++}`);
                params.push(filters.regionId);
            }

            if (filters.assignedService) {
                if (filters.assignedService === 'sgds') {
                    conditions.push(`(m.assigned_service = 'sgds' OR (m.assigned_service IS NULL AND m.mission_type IN ('waste_collection', 'sanitation', 'ecological_restoration', 'reforestation', 'biodiversity_survey')))`);
                } else if (filters.assignedService === 'dst') {
                    conditions.push(`(m.assigned_service = 'dst' OR (m.assigned_service IS NULL AND m.mission_type NOT IN ('waste_collection', 'sanitation', 'ecological_restoration', 'reforestation', 'biodiversity_survey')))`);
                }
            }

            if (filters.teamId) {
                conditions.push(`m.assigned_team_id = $${paramIdx++}`);
                params.push(filters.teamId);
            }

            const whereClause = `WHERE ${conditions.join(' AND ')}`;

            const result = await this.db.query(`
                SELECT 
                    i.id, i.mission_id as "missionId", i.intervention_type as "interventionType",
                    i.status, i.started_at as "startedAt", i.ended_at as "endedAt",
                    i.created_at as "createdAt",
                    i.assigned_to_user_id as "userId",
                    i.completion_percentage as "completionPercentage",
                    i.priority,
                    CONCAT(u.first_name, ' ', u.last_name) as "agentName"
                FROM interventions i
                LEFT JOIN missions m ON i.mission_id = m.id
                LEFT JOIN municipalities mun ON m.municipality_id = mun.id
                LEFT JOIN users u ON i.assigned_to_user_id = u.id
                ${whereClause}
                ORDER BY i.created_at DESC
            `, params);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching interventions by mission:', error);
            throw error;
        }
    }

    async create(missionId: string, interventionType: string, userId?: string, priority?: string): Promise<InterventionRecord> {
        try {
            const result = await this.db.query(`
                INSERT INTO interventions (id, mission_id, intervention_type, assigned_to_user_id, status, started_at, priority)
                VALUES (
                           gen_random_uuid(),
                           $1,
                           $2,
                           $3,
                           'in_progress',
                           NOW(),
                           COALESCE($4, 'medium')::priority_level_enum 
                       )
                    RETURNING id, mission_id as "missionId", intervention_type as "interventionType", status, created_at as "createdAt", started_at as "startedAt", priority, assigned_to_user_id as "userId"
            `, [missionId, interventionType, userId || null, priority || null]);

            return result.rows[0];
        } catch (error) {
            this.logger.error('Error creating intervention:', error);
            throw error;
        }
    }

async updateIntervention(id: string, data: any): Promise<InterventionRecord | null> {
    try {
        const currentRes = await this.db.query(`SELECT status FROM interventions WHERE id = $1`, [id]);
        const oldStatus = currentRes.rows.length > 0 ? currentRes.rows[0].status : null;

        const setClauses: string[] = [];
        const params: any[] = [id];
        let paramIdx = 2;

        if (data.status) {
            setClauses.push(`status = $${paramIdx++}::field_assignment_status_enum`);
            params.push(data.status);
            setClauses.push(`started_at = CASE WHEN $${paramIdx - 1}::field_assignment_status_enum = 'in_progress'::field_assignment_status_enum AND started_at IS NULL THEN NOW() ELSE started_at END`);
            setClauses.push(`ended_at = CASE WHEN $${paramIdx - 1}::field_assignment_status_enum = 'completed'::field_assignment_status_enum AND ended_at IS NULL THEN NOW() ELSE ended_at END`);
            setClauses.push(`completion_percentage = CASE WHEN $${paramIdx - 1}::field_assignment_status_enum = 'completed'::field_assignment_status_enum THEN 100 ELSE completion_percentage END`);
        }
        
        if (data.completionPercentage != null) {
            setClauses.push(`completion_percentage = $${paramIdx++}`);
            params.push(data.completionPercentage);
        }

        if (data.priority) {
            setClauses.push(`priority = $${paramIdx++}::priority_level_enum`);
            params.push(data.priority);
        }

        if (data.userId !== undefined) {
            setClauses.push(`assigned_to_user_id = $${paramIdx++}`);
            params.push(data.userId);
        }

        if (setClauses.length === 0) return null;

        const result = await this.db.query(`
            UPDATE interventions 
            SET ${setClauses.join(', ')}
            WHERE id = $1
            RETURNING id, mission_id as "missionId", status, started_at as "startedAt", ended_at as "endedAt", completion_percentage as "completionPercentage", priority, assigned_to_user_id as "userId"
        `, params);
        
        const updated = result.rows.length > 0 ? result.rows[0] : null;

        // Si le statut a changé, ajouter un log automatique
        if (updated && data.status && oldStatus !== data.status) {
            await this.addLog({
                interventionId: id,
                authorId: data.userId, // use data.userId or whatever is available, maybe need to pass authorId
                logType: 'status_change',
                oldStatus,
                newStatus: data.status,
                comment: `Statut mis à jour : ${data.status}`
            });

            // Automatisation : Mise à jour de la mission parente
            if (data.status === 'in_progress') {
                await this.db.query(`
                    UPDATE missions 
                    SET status = 'in_progress'
                    WHERE id = $1 AND status NOT IN ('in_progress', 'completed', 'validated')
                `, [updated.missionId]);
            } else if (data.status === 'completed') {
                const allCompletedRes = await this.db.query(`
                    SELECT count(*) as total,
                           count(*) FILTER (WHERE status = 'completed') as completed
                    FROM interventions
                    WHERE mission_id = $1 AND deleted_at IS NULL
                `, [updated.missionId]);
                
                const { total, completed } = allCompletedRes.rows[0];
                
                if (total > 0 && Number(total) === Number(completed)) {
                    await this.db.query(`
                        UPDATE missions 
                        SET status = 'completed', completed_at = NOW()
                        WHERE id = $1 AND status NOT IN ('completed', 'validated')
                    `, [updated.missionId]);
                }
            }
        }

        return updated;
    } catch (error) {
        this.logger.error('Error updating intervention status:', error);
        throw error;
    }
}

    async addLog(data: CreateInterventionLogDTO): Promise<InterventionLog> {
        const result = await this.db.query(`
            INSERT INTO intervention_logs (intervention_id, author_id, log_type, old_status, new_status, comment)
            VALUES ($1, $2, $3::intervention_log_type, $4::field_assignment_status_enum, $5::field_assignment_status_enum, $6)
            RETURNING id, intervention_id as "interventionId", author_id as "authorId", log_type as "logType", old_status as "oldStatus", new_status as "newStatus", comment, created_at as "createdAt"
        `, [data.interventionId, data.authorId || null, data.logType, data.oldStatus || null, data.newStatus || null, data.comment || null]);
        
        return result.rows[0];
    }

async getLogsByInterventionId(interventionId: string): Promise<InterventionLog[]> {
    const result = await this.db.query(`
        SELECT l.id, l.intervention_id as "interventionId", l.author_id as "authorId",
               l.log_type as "logType", l.old_status as "oldStatus", l.new_status as "newStatus",
               l.comment, l.created_at as "createdAt",
               CONCAT(u.first_name, ' ', u.last_name) as "authorName",
               r.name as "authorRole" 
        FROM intervention_logs l
                 LEFT JOIN users u ON l.author_id = u.id
                 LEFT JOIN role_user ru ON u.id = ru.user_id 
                 LEFT JOIN roles r ON ru.role_id = r.id       
        WHERE l.intervention_id = $1
        ORDER BY l.created_at DESC
    `, [interventionId]);

    return result.rows;
}


    // ── Méthodes décisionnelles (Stats, Traçabilité, Export) ──────────────

    async getStats(filters: any = {}): Promise<{
        stats: StatsRecord;
        byType: TypeStatRecord[];
        byMunicipality: MunicipalityStatRecord[];
    }> {
        const conditions: string[] = ['i.deleted_at IS NULL'];
        const params: any[] = [];
        let idx = 1;

        if (filters.municipalityId) { conditions.push(`m.municipality_id = $${idx++}`); params.push(filters.municipalityId); }
        if (filters.dateFrom) { conditions.push(`i.created_at >= $${idx++}`); params.push(filters.dateFrom); }
        if (filters.dateTo) { conditions.push(`i.created_at <= $${idx++}`); params.push(filters.dateTo); }
        if (filters.regionId) { conditions.push(`mun.region_id = $${idx++}`); params.push(filters.regionId); }

        if (filters.assignedService) {
            if (filters.assignedService === 'sgds') {
                conditions.push(`(m.assigned_service = 'sgds' OR (m.assigned_service IS NULL AND m.mission_type IN ('waste_collection', 'sanitation', 'ecological_restoration', 'reforestation', 'biodiversity_survey')))`);
            } else if (filters.assignedService === 'dst') {
                conditions.push(`(m.assigned_service = 'dst' OR (m.assigned_service IS NULL AND m.mission_type NOT IN ('waste_collection', 'sanitation', 'ecological_restoration', 'reforestation', 'biodiversity_survey')))`);
            }
        }

        if (filters.teamId) { conditions.push(`m.assigned_team_id = $${idx++}`); params.push(filters.teamId); }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const statsResult = await this.db.query(`
            SELECT
                COUNT(*)::int as total,
                COUNT(*) FILTER (WHERE i.status = 'in_progress')::int as "inProgress",
                COUNT(*) FILTER (WHERE i.status = 'completed' AND i.ended_at::date = CURRENT_DATE)::int as "completedToday",
                COALESCE(AVG(EXTRACT(EPOCH FROM (i.ended_at - i.started_at)) / 3600) FILTER (WHERE i.ended_at IS NOT NULL), 0)::numeric(10,1) as "averageResolutionHours"
            FROM interventions i
            LEFT JOIN missions m ON i.mission_id = m.id
            LEFT JOIN municipalities mun ON m.municipality_id = mun.id
            ${where}
        `, params);

        const byTypeResult = await this.db.query(`
            SELECT i.intervention_type as type, COUNT(*)::int as count
            FROM interventions i
            LEFT JOIN missions m ON i.mission_id = m.id
            LEFT JOIN municipalities mun ON m.municipality_id = mun.id
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

    async getTraceabilityByReport(reportId: string): Promise<{
        report: TraceabilityReportRecord | null;
        missions: TraceabilityMissionRecord[];
        interventions: TraceabilityInterventionRecord[];
    }> {
        const reportResult = await this.db.query(`
            SELECT tr.id, tr.title, tr.issue_category as category, tr.status, tr.priority,
                   tr.reported_at as "reportedAt", mun.name as "municipalityName",
                   reg.name as "regionName", dist.name as "districtName", neigh.name as "neighborhoodName",
                   CONCAT(u.first_name, ' ', u.last_name) as "creatorName"
            FROM technician_reports tr
            LEFT JOIN municipalities mun ON tr.municipality_id = mun.id
            LEFT JOIN regions reg ON tr.region_id = reg.id
            LEFT JOIN districts dist ON tr.district_id = dist.id
            LEFT JOIN neighborhoods neigh ON tr.neighborhood_id = neigh.id
            LEFT JOIN users u ON tr.created_by = u.id
            WHERE tr.id = $1 AND tr.deleted_at IS NULL
        `, [reportId]);

        const missionsResult = await this.db.query(`
            SELECT m.id, m.title, m.status, m.scheduled_at as "scheduledAt",
                   m.completed_at as "completedAt", ft.name as "teamName",
                   CONCAT(creator.first_name, ' ', creator.last_name) as "creatorName"
            FROM missions m
            LEFT JOIN field_teams ft ON m.assigned_team_id = ft.id
            LEFT JOIN users creator ON m.created_by = creator.id
            WHERE m.report_id = $1
            ORDER BY m.created_at ASC
        `, [reportId]);

        const interventionsResult = await this.db.query(`
            SELECT i.id, i.intervention_type as type, i.status,
                   i.started_at as "startedAt", i.ended_at as "endedAt",
                   CONCAT(u.first_name, ' ', u.last_name) as "agentName",
                   i.completion_percentage as "completionPercentage"
            FROM interventions i
            LEFT JOIN missions m ON i.mission_id = m.id
            LEFT JOIN users u ON i.assigned_to_user_id = u.id
            WHERE m.report_id = $1
            ORDER BY i.created_at ASC
        `, [reportId]);

        return {
            report: reportResult.rows[0] || null,
            missions: missionsResult.rows,
            interventions: interventionsResult.rows,
        };
    }

    async exportCSV(filters: any = {}): Promise<ExportRecord[]> {
        const conditions: string[] = ['i.deleted_at IS NULL'];
        const params: any[] = [];
        let idx = 1;

        if (filters.municipalityId) { conditions.push(`m.municipality_id = $${idx++}`); params.push(filters.municipalityId); }
        if (filters.dateFrom) { conditions.push(`i.created_at >= $${idx++}`); params.push(filters.dateFrom); }
        if (filters.dateTo) { conditions.push(`i.created_at <= $${idx++}`); params.push(filters.dateTo); }
        if (filters.status) { conditions.push(`i.status = $${idx++}`); params.push(filters.status); }
        if (filters.regionId) { conditions.push(`mun.region_id = $${idx++}`); params.push(filters.regionId); }

        if (filters.assignedService) {
            if (filters.assignedService === 'sgds') {
                conditions.push(`(m.assigned_service = 'sgds' OR (m.assigned_service IS NULL AND m.mission_type IN ('waste_collection', 'sanitation', 'ecological_restoration', 'reforestation', 'biodiversity_survey')))`);
            } else if (filters.assignedService === 'dst') {
                conditions.push(`(m.assigned_service = 'dst' OR (m.assigned_service IS NULL AND m.mission_type NOT IN ('waste_collection', 'sanitation', 'ecological_restoration', 'reforestation', 'biodiversity_survey')))`);
            }
        }

        if (filters.teamId) { conditions.push(`m.assigned_team_id = $${idx++}`); params.push(filters.teamId); }

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