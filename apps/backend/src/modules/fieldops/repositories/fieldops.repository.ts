import PostgresDatabase from '../../../infra/database/postgres';
import type { Logger } from 'winston';

export interface FieldOpsRawStats {
    active_missions: string;
    planned_missions: string;
    completed_today: string;
    total_missions: string;
    pending_reports: string;
    resolved_reports: string;
    critical_reports: string;
    total_reports: string;
    active_interventions: string;
    total_interventions: string;
    active_teams: string;
    total_teams: string;
}

export class FieldOpsRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger,
    ) {}

    async getSummary(filters: {
        municipalityId?: string;
        regionId?: string;
        createdBy?: string;
    }): Promise<FieldOpsRawStats | null> {
        try {
            const missionConditions: string[] = [];
            const reportConditions: string[] = ['tr.deleted_at IS NULL'];
            const interventionConditions: string[] = ['i.deleted_at IS NULL'];
            const params: any[] = [];
            let idx = 1;

            if (filters.municipalityId) {
                const p = `$${idx++}`;
                params.push(filters.municipalityId);
                missionConditions.push(`m.municipality_id = ${p}`);
                reportConditions.push(`tr.municipality_id = ${p}`);
                interventionConditions.push(`i.municipality_id = ${p}`);
            }
            if (filters.regionId) {
                const p = `$${idx++}`;
                params.push(filters.regionId);
                reportConditions.push(`tr.region_id = ${p}`);
                missionConditions.push(`mun.region_id = ${p}`);
            }
            if (filters.createdBy) {
                const p = `$${idx++}`;
                params.push(filters.createdBy);
                reportConditions.push(`tr.created_by = ${p}`);
            }

            const missionWhere = missionConditions.length > 0 ? `WHERE ${missionConditions.join(' AND ')}` : '';
            const reportWhere = `WHERE ${reportConditions.join(' AND ')}`;
            const interventionWhere = interventionConditions.length > 0 ? `WHERE ${interventionConditions.join(' AND ')}` : '';

            const sql = `
                WITH mission_stats AS (
                    SELECT 
                        COUNT(*) FILTER (WHERE m.status = 'in_progress') as active_missions,
                        COUNT(*) FILTER (WHERE m.status IN ('planned','assigned')) as planned_missions,
                        COUNT(*) FILTER (WHERE m.status = 'completed') as completed_today,
                        COUNT(*) as total_missions
                    FROM missions m
                    LEFT JOIN municipalities mun ON m.municipality_id = mun.id
                    ${missionWhere}
                ),
                report_stats AS (
                    SELECT 
                        COUNT(*) FILTER (WHERE tr.status IN ('submitted','assigned','in_progress')) as pending_reports,
                        COUNT(*) FILTER (WHERE tr.status IN ('resolved','validated')) as resolved_reports,
                        COUNT(*) FILTER (WHERE tr.priority IN ('critical','emergency')) as critical_reports,
                        COUNT(*) as total_reports
                    FROM technician_reports tr
                    ${reportWhere}
                ),
                intervention_stats AS (
                    SELECT 
                        COUNT(*) FILTER (WHERE i.status = 'in_progress') as active_interventions,
                        COUNT(*) as total_interventions
                    FROM interventions i
                    ${interventionWhere}
                ),
                team_stats AS (
                    SELECT 
                        COUNT(*) FILTER (WHERE ft.status = 'active') as active_teams,
                        COUNT(*) as total_teams
                    FROM field_teams ft
                )
                SELECT 
                    ms.*, rs.*, ints.*, ts.*
                FROM mission_stats ms
                CROSS JOIN report_stats rs
                CROSS JOIN intervention_stats ints
                CROSS JOIN team_stats ts
            `;

            const result = await this.db.query(sql, params);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error('Error fetching field ops summary:', error);
            throw error;
        }
    }
}