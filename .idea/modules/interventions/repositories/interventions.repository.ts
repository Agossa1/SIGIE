import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import type { Logger } from 'winston';
import { 
    Intervention, CreateInterventionDTO,
    CreateInterventionReportDTO, FieldAssignmentStatus
} from '../types/interventions.types';

export class InterventionsRepository {
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

    async createIntervention(dto: CreateInterventionDTO): Promise<string> {
        try {
            const sql = `
                INSERT INTO interventions (mission_id, intervention_type, status)
                VALUES ($1, $2, 'pending')
                RETURNING id
            `;
            const result = await this.db.query(sql, [dto.missionId, dto.interventionType]);
            return result.rows[0].id;
        } catch (error) {
            this.logger.error('Error creating intervention:', error);
            throw new BadRequestError('Erreur lors de la création de l\'intervention');
        }
    }

    async getInterventionsByMission(missionId: string): Promise<Intervention[]> {
        try {
            const sql = `
                SELECT 
                    i.id, i.mission_id as "missionId", i.intervention_type as "interventionType",
                    i.status, i.started_at as "startedAt", i.ended_at as "endedAt", i.created_at as "createdAt",
                    ST_Y(m.location::geometry) as "latitude",
                    ST_X(m.location::geometry) as "longitude"
                FROM interventions i
                LEFT JOIN missions m ON i.mission_id = m.id
                WHERE i.mission_id = $1
                ORDER BY i.created_at DESC
            `;
            const result = await this.db.query(sql, [missionId]);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching interventions:', error);
            throw new BadRequestError('Erreur lors de la récupération des interventions');
        }
    }

    async getInterventionsByTeamId(teamId: string): Promise<Intervention[]> {
        try {
            const sql = `
                SELECT 
                    i.id, i.mission_id as "missionId", i.intervention_type as "interventionType",
                    i.status, i.started_at as "startedAt", i.ended_at as "endedAt", i.created_at as "createdAt",
                    ST_Y(m.location::geometry) as "latitude",
                    ST_X(m.location::geometry) as "longitude"
                FROM interventions i
                JOIN missions m ON i.mission_id = m.id
                WHERE m.assigned_team_id = $1
                ORDER BY i.created_at DESC
            `;
            const result = await this.db.query(sql, [teamId]);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching interventions by team:', error);
            throw new BadRequestError('Erreur lors de la récupération des interventions');
        }
    }

    async updateInterventionStatus(id: string, status: FieldAssignmentStatus): Promise<void> {
        try {
            let sql = `UPDATE interventions SET status = $1::field_assignment_status_enum`;
            if (status === FieldAssignmentStatus.IN_PROGRESS) {
                sql += `, started_at = NOW()`;
            } else if (status === FieldAssignmentStatus.COMPLETED) {
                sql += `, ended_at = NOW()`;
            }
            sql += ` WHERE id = $2`;
            
            await this.db.query(sql, [status, id]);
        } catch (error) {
            this.logger.error('Error updating intervention status:', error);
            throw new BadRequestError('Erreur lors de la mise à jour du statut');
        }
    }

    async addInterventionReport(interventionId: string, createdBy: string, dto: CreateInterventionReportDTO): Promise<string> {
        try {
            const sql = `
                INSERT INTO field_intervention_reports (
                    intervention_id, report_id, created_by, work_done,
                    blockage_removed_pct, final_condition_score, recommendations, completed
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `;
            const params = [
                interventionId,
                dto.reportId || null,
                createdBy,
                dto.workDone,
                dto.blockageRemovedPct || null,
                dto.finalConditionScore || null,
                dto.recommendations || null,
                dto.completed ?? false
            ];
            const result = await this.db.query(sql, params);
            return result.rows[0].id;
        } catch (error) {
            this.logger.error('Error adding intervention report:', error);
            throw new BadRequestError('Erreur lors de la création du rapport d\'intervention');
        }
    }
}
