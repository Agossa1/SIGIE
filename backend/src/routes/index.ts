import { Router } from 'express';
import PostgresDatabase from '../infra/database/postgres';
import { configureAuthRoutes } from '../modules/auth/routes/auth.routes';
import { configureReportsRoutes } from '../modules/reports/routes/reports.routes';
import { configureTerritoryRoutes } from '../modules/territory/territory.module';
import { missionsRouter } from '../modules/missions/routes/missions.routes';
import { configureTeamsRoutes } from '../modules/teams/teams.module';
import { usersRouter } from '../modules/users/routes/users.routes';
import { rolesRouter } from '../modules/roles/routes/roles.routes';
import { configureGisRoutes } from '../modules/gis/gis.module';
import { configureInterventionsRoutes } from '../modules/interventions/interventions.module';
import { configureOrganizationsRoutes } from '../modules/organizations/organizations.module';
import { configureInfrastructureRoutes } from '../modules/infrastructure/infrastructure.module';
import { configureSanitationRoutes } from '../modules/sanitation/sanitation.module';
import { configureAlertsRoutes } from '../modules/alerts/alerts.module';
import { configureAuditRoutes } from '../modules/audit/audit.module';
import { configureFieldOpsRoutes } from '../modules/fieldops/fieldops.module';
import { configureProfilesRoutes } from '../modules/profiles/profiles.module';
import { configureAnalyticsRoutes } from '../modules/analytics/analytics.module';
import { configureNotificationsRoutes } from '../modules/notifications/notifications.module';
import { configureStubRoutes } from '../modules/stubs/stubs.module';

export const configureRoutes = (db: PostgresDatabase) => {
    const router = Router();

    router.use('/auth', configureAuthRoutes(db));
    router.use('/reports', configureReportsRoutes(db));
    router.use('/territory', configureTerritoryRoutes(db));
    router.use('/missions', missionsRouter(db));
    router.use('/teams', configureTeamsRoutes(db));
    router.use('/users', usersRouter(db));
    router.use('/roles', rolesRouter(db));
    router.use('/gis', configureGisRoutes(db));
    router.use('/interventions', configureInterventionsRoutes(db));
    router.use('/organizations', configureOrganizationsRoutes(db));
    router.use('/infrastructure', configureInfrastructureRoutes(db));
    router.use('/sanitation', configureSanitationRoutes(db));
    router.use('/alerts', configureAlertsRoutes(db));
    router.use('/audit', configureAuditRoutes(db));
    router.use('/fieldops', configureFieldOpsRoutes(db));
    router.use('/profiles', configureProfilesRoutes(db));
    router.use('/analytics', configureAnalyticsRoutes(db));
    router.use('/notifications', configureNotificationsRoutes(db));

    // Stubs pour modules non encore migrés (évite les 404)
    router.use('/', configureStubRoutes(db));

    return router;
};
