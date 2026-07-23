import { Router, Request, Response, NextFunction } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

/**
 * Module Analytics — KPIs filtrés par territoire et rôle.
 * Endpoint unique GET /api/analytics/summary qui retourne les indicateurs clés.
 */
export function configureAnalyticsRoutes(db: PostgresDatabase): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const roles: string[] = (user?.roles || []).map((r: any) => String(r));
            const municipalityId = req.query.municipalityId as string || user?.municipalityId;
            const regionId = req.query.regionId as string || user?.regionId;

            // Déterminer les filtres selon le rôle
            let reportFilter = '';
            let missionFilter = '';
            const params: any[] = [];
            let idx = 1;

            const isAdmin = roles.includes('super_admin') || roles.includes('platform_admin');
            const isNational = roles.includes('ministry');

            if (!isAdmin && !isNational) {
                if (municipalityId) {
                    reportFilter = `WHERE tr.municipality_id = $${idx} AND tr.deleted_at IS NULL`;
                    missionFilter = `WHERE m.municipality_id = $${idx}`;
                    params.push(municipalityId);
                    idx++;
                } else if (regionId) {
                    reportFilter = `WHERE tr.region_id = $${idx} AND tr.deleted_at IS NULL`;
                    missionFilter = `WHERE m.region_id = $${idx}`;
                    params.push(regionId);
                    idx++;
                } else if (roles.includes('technician')) {
                    reportFilter = `WHERE tr.created_by = $${idx} AND tr.deleted_at IS NULL`;
                    params.push(user.id);
                    idx++;
                } else {
                    reportFilter = `WHERE tr.deleted_at IS NULL`;
                }
            } else {
                reportFilter = `WHERE tr.deleted_at IS NULL`;
            }

            // Requêtes KPI
            const queries = [
                // Total signalements
                `SELECT count(*) as total FROM technician_reports tr ${reportFilter}`,
                // Signalements résolus
                `SELECT count(*) as total FROM technician_reports tr ${reportFilter} AND tr.status IN ('resolved', 'validated')`,
                // Signalements en cours
                `SELECT count(*) as total FROM technician_reports tr ${reportFilter} AND tr.status IN ('submitted', 'validated_by_team', 'pending_dst', 'pending_sgds', 'assigned', 'in_progress')`,
                // Total missions
                `SELECT count(*) as total FROM missions m ${missionFilter || reportFilter.replace('tr.', 'm.').replace('technician_reports', 'missions')}`,
                // Missions validées
                `SELECT count(*) as total FROM missions m ${missionFilter || reportFilter.replace('tr.', 'm.').replace('technician_reports', 'missions')} AND m.status = 'validated'`,
                // Taux de résolution (SLA)
                `SELECT 
                    count(*) as total,
                    count(CASE WHEN tr.resolved_at IS NOT NULL AND tr.resolved_at - tr.reported_at <= interval '1 hour' * tr.sla_hours THEN 1 END) as within_sla
                 FROM technician_reports tr ${reportFilter} AND tr.status IN ('resolved', 'validated')`,
                // Répartition par catégorie
                `SELECT tr.issue_category, count(*) as count 
                 FROM technician_reports tr ${reportFilter} 
                 GROUP BY tr.issue_category ORDER BY count DESC LIMIT 5`,
                // Répartition par priorité
                `SELECT tr.priority, count(*) as count 
                 FROM technician_reports tr ${reportFilter} 
                 GROUP BY tr.priority ORDER BY count DESC`,
            ];

            const results = await Promise.all(queries.map(q => db.query(q, params)));

            const totalReports = parseInt(results[0].rows[0]?.total || '0');
            const resolvedReports = parseInt(results[1].rows[0]?.total || '0');
            const activeReports = parseInt(results[2].rows[0]?.total || '0');
            const totalMissions = parseInt(results[3].rows[0]?.total || '0');
            const validatedMissions = parseInt(results[4].rows[0]?.total || '0');
            const slaTotal = parseInt(results[5].rows[0]?.total || '0');
            const slaWithin = parseInt(results[5].rows[0]?.within_sla || '0');
            const categories = results[6].rows;
            const priorities = results[7].rows;

            res.json({
                success: true,
                data: {
                    reports: {
                        total: totalReports,
                        resolved: resolvedReports,
                        active: activeReports,
                        resolutionRate: totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0,
                    },
                    missions: {
                        total: totalMissions,
                        validated: validatedMissions,
                        completionRate: totalMissions > 0 ? Math.round((validatedMissions / totalMissions) * 100) : 0,
                    },
                    sla: {
                        total: slaTotal,
                        withinSla: slaWithin,
                        complianceRate: slaTotal > 0 ? Math.round((slaWithin / slaTotal) * 100) : 100,
                    },
                    categories: categories.map((r: any) => ({ name: r.issue_category, count: parseInt(r.count) })),
                    priorities: priorities.map((r: any) => ({ name: r.priority, count: parseInt(r.count) })),
                },
            });
        } catch (error) {
            next(error);
        }
    });

    return router;
}