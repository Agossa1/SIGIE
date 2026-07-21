import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { TeamsRepository } from './repositories/teams.repository';
import { GetAllTeamsService } from './services/get-all-teams.service';
import { GetTeamMembersService } from './services/get-team-members.service';
import { GetAllTeamsController } from './controllers/get-all.controller';
import { GetTeamMembersController } from './controllers/get-members.controller';
import { configureTeamsRouter } from './routes/teams.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module Teams — Gestion des équipes et brigades.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureTeamsRoutes(db: PostgresDatabase): Router {
    const repository = new TeamsRepository(db, logger);

    // Services
    const getAllService = new GetAllTeamsService(repository);
    const getMembersService = new GetTeamMembersService(repository);

    // Controllers
    const getAllCtrl = new GetAllTeamsController(getAllService);
    const getMembersCtrl = new GetTeamMembersController(getMembersService);

    // Routes
    return configureTeamsRouter(getAllCtrl, getMembersCtrl);
}