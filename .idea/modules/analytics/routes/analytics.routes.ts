import { Router } from 'express';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { createLogger, format, transports } from 'winston';
import { authMiddleware, requireRole } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';

export const analyticsRouter = (db: PostgresDatabase) => {
    const router = Router();
    const logger = createLogger({ format: format.simple(), transports: [new transports.Console()] });

    /**
     * GET /analytics/summary
     * Renvoie les métriques globales de gestion de projet
     */
    router.get('/summary', authMiddleware, requireRole(['super_admin', 'platform_admin', 'ministry', 'prefecture_director', 'mayor', 'dst_manager', 'sgds_manager']), async (req, res, next) => {
        try {
            const sql = `
                WITH
                -- ─── Reports ───────────────────────────────────────────────────────────────
                report_stats AS (
                    SELECT
                        COUNT(*) FILTER (WHERE status IN ('submitted','assigned','in_progress'))        AS active_reports,
                        COUNT(*) FILTER (WHERE status IN ('resolved','validated'))                      AS resolved_reports,
                        COUNT(*) FILTER (WHERE status = 'submitted')                                    AS pending_triage,
                        COUNT(*) FILTER (WHERE issue_category = 'drainage')                             AS drainage_count,
                        COUNT(*) FILTER (WHERE issue_category = 'waste')                                AS waste_count,
                        COUNT(*) FILTER (WHERE issue_category = 'road')                                 AS road_count,
                        COUNT(*) FILTER (WHERE issue_category = 'flooding')                             AS flooding_count,
                        COUNT(*)                                                                         AS total_reports,
                        -- SLA: rapports en retard (en cours depuis > sla_hours)
                        COUNT(*) FILTER (
                            WHERE status IN ('submitted','assigned','in_progress')
                            AND created_at < NOW() - (COALESCE(sla_hours, 48) * INTERVAL '1 hour')
                        ) AS sla_breached,
                        -- Temps de résolution moyen en heures
                        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)
                            FILTER (WHERE resolved_at IS NOT NULL)  AS avg_resolution_hours
                    FROM technician_reports
                    WHERE deleted_at IS NULL
                ),
                -- ─── Missions ──────────────────────────────────────────────────────────────
                mission_stats AS (
                    SELECT
                        COUNT(*) FILTER (WHERE status = 'in_progress')                                  AS in_progress_missions,
                        COUNT(*) FILTER (WHERE status = 'completed')                                    AS completed_missions,
                        COUNT(*) FILTER (WHERE status = 'validated')                                    AS validated_missions,
                        COUNT(*) FILTER (WHERE status = 'draft')                                        AS draft_missions,
                        COUNT(*) FILTER (WHERE status NOT IN ('completed','validated','cancelled')
                            AND due_date IS NOT NULL AND due_date < NOW())                               AS overdue_missions,
                        COUNT(*)                                                                         AS total_missions,
                        AVG(actual_hours)   FILTER (WHERE actual_hours IS NOT NULL)                     AS avg_actual_hours,
                        AVG(estimated_hours) FILTER (WHERE estimated_hours IS NOT NULL)                 AS avg_estimated_hours
                    FROM missions
                ),
                -- ─── Interventions ─────────────────────────────────────────────────────────
                intervention_stats AS (
                    SELECT
                        COUNT(*)                                                                         AS total_interventions,
                        COUNT(*) FILTER (WHERE status = 'completed')                                    AS completed_interventions,
                        AVG(EXTRACT(EPOCH FROM (ended_at - started_at)) / 3600)
                            FILTER (WHERE ended_at IS NOT NULL AND started_at IS NOT NULL)               AS avg_duration_hours,
                        AVG(final_condition_score)
                            FILTER (WHERE final_condition_score IS NOT NULL)                             AS avg_condition_score
                    FROM interventions
                ),
                -- ─── Teams ─────────────────────────────────────────────────────────────────
                team_stats AS (
                    SELECT
                        COUNT(*)                                        AS total_teams,
                        COUNT(*) FILTER (WHERE status = 'active')       AS active_teams,
                        (
                            SELECT COUNT(*) FROM team_members WHERE status = 'active'
                        )                                               AS total_members
                    FROM field_teams
                )
                SELECT
                    row_to_json(report_stats)       AS reports,
                    row_to_json(mission_stats)      AS missions,
                    row_to_json(intervention_stats) AS interventions,
                    row_to_json(team_stats)         AS teams
                FROM report_stats, mission_stats, intervention_stats, team_stats
            `;

            const result = await db.query(sql, []);
            const row = result.rows[0];

            res.json({
                success: true,
                data: {
                    reports: {
                        active:             Number(row.reports.active_reports) || 0,
                        resolved:           Number(row.reports.resolved_reports) || 0,
                        pendingTriage:      Number(row.reports.pending_triage) || 0,
                        total:              Number(row.reports.total_reports) || 0,
                        slaBreached:        Number(row.reports.sla_breached) || 0,
                        avgResolutionHours: parseFloat(row.reports.avg_resolution_hours) || null,
                        byCategory: {
                            drainage: Number(row.reports.drainage_count) || 0,
                            waste:    Number(row.reports.waste_count) || 0,
                            road:     Number(row.reports.road_count) || 0,
                            flooding: Number(row.reports.flooding_count) || 0,
                        }
                    },
                    missions: {
                        inProgress:       Number(row.missions.in_progress_missions) || 0,
                        completed:        Number(row.missions.completed_missions) || 0,
                        validated:        Number(row.missions.validated_missions) || 0,
                        draft:            Number(row.missions.draft_missions) || 0,
                        overdue:          Number(row.missions.overdue_missions) || 0,
                        total:            Number(row.missions.total_missions) || 0,
                        avgActualHours:   parseFloat(row.missions.avg_actual_hours) || null,
                        avgEstimatedHours:parseFloat(row.missions.avg_estimated_hours) || null,
                    },
                    interventions: {
                        total:            Number(row.interventions.total_interventions) || 0,
                        completed:        Number(row.interventions.completed_interventions) || 0,
                        avgDurationHours: parseFloat(row.interventions.avg_duration_hours) || null,
                        avgConditionScore:parseFloat(row.interventions.avg_condition_score) || null,
                    },
                    teams: {
                        total:            Number(row.teams.total_teams) || 0,
                        active:           Number(row.teams.active_teams) || 0,
                        totalMembers:     Number(row.teams.total_members) || 0,
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching analytics summary:', error);
            next(error);
        }
    });

    return router;
};
