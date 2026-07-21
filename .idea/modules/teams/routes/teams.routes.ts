import { Router } from 'express';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { logger } from '../../../../apps/backend/src/shared/loggers/logger';
import { authMiddleware } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';
import { TeamRepository } from '../repositories/team.repository';
import { 
    CreateNewBrigadeService,
    GetOrganizationTeamsService,
    TransferAgentService,
    CheckInAgentService,
    UpdateTeamService,
    DeleteTeamService
} from '../services/team.service';
import { 
    CreateTeamController, 
    GetAllTeamsController, 
    TransferMemberController, 
    SelfCheckInController,
    UpdateTeamController,
    DeleteTeamController,
    GetTeamLocationsController,
    GetTeamMembersController,
    AddTeamMemberController,
    RemoveTeamMemberController
} from '../controllers/team.controller';

/**
 * Configure les routes du module de gestion d'équipes (Brigades)
 * @param db Instance de la base de données
 */
export const configureTeamsRoutes = (db: PostgresDatabase) => {
    const router = Router();
    
    // Protection de toutes les routes de gestion d'équipes
    router.use(authMiddleware);

    // Initialisation du Repository
    const teamRepository = new TeamRepository(db, logger);

    // Initialisation des Services (un par Use Case)
    const createTeamService = new CreateNewBrigadeService(teamRepository, logger);
    const getTeamsService = new GetOrganizationTeamsService(teamRepository, logger);
    const transferService = new TransferAgentService(teamRepository, logger);
    const checkInService = new CheckInAgentService(teamRepository, logger);
    const updateTeamService = new UpdateTeamService(teamRepository, logger);
    const deleteTeamService = new DeleteTeamService(teamRepository, logger);

    // Initialisation des Contrôleurs
    const createTeamController = new CreateTeamController(createTeamService);
    const getAllTeamsController = new GetAllTeamsController(getTeamsService);
    const transferMemberController = new TransferMemberController(transferService);
    const selfCheckInController = new SelfCheckInController(checkInService);
    const updateTeamController = new UpdateTeamController(updateTeamService);
    const deleteTeamController = new DeleteTeamController(deleteTeamService);
    const getTeamLocationsController = new GetTeamLocationsController(teamRepository);
    const getTeamMembersController = new GetTeamMembersController(teamRepository);
    const addTeamMemberController = new AddTeamMemberController(teamRepository);
    const removeTeamMemberController = new RemoveTeamMemberController(teamRepository);

    // ── Routes principales ──
    router.get('/', getAllTeamsController.handle);
    router.get('/locations', getTeamLocationsController.handle);
    router.post('/', createTeamController.handle);
    router.post('/transfer', transferMemberController.handle);
    router.post('/check-in', selfCheckInController.handle);
    router.patch('/:id', updateTeamController.handle);
    router.delete('/:id', deleteTeamController.handle);

    // ── Gestion des membres ──
    router.get('/:id/members', getTeamMembersController.handle);
    router.post('/:id/members', addTeamMemberController.handle);
    router.delete('/:id/members/:userId', removeTeamMemberController.handle);

    return router;
};