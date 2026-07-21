import { Router } from 'express';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { logger } from '../../../../apps/backend/src/shared/loggers/logger';
import { TerritoryRepository } from '../repositories/territory.repositories';
import { CreateTerritoryService } from '../services/create.service';
import { GetTerritoryService } from '../services/get.service';
import { DeleteTerritoryService } from '../services/delete.service';
import { UpdateTerritoryService } from '../services/update.service';
import { CreateTerritoryController } from '../controllers/create.controller';
import { GetTerritoryController } from '../controllers/get.controller';
import { DeleteTerritoryController } from '../controllers/delete.controller';
import { TerritoryController } from '../controllers/territory.controller';
import { authMiddleware, requireRole } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';

export const territoryRouter = (db: PostgresDatabase) => {
    const router = Router();

    // Instanciation du Repository
    const territoryRepository = new TerritoryRepository(db, logger);

    // Instanciation des Services
    const createService = new CreateTerritoryService(territoryRepository);
    const getService = new GetTerritoryService(territoryRepository);
    const deleteService = new DeleteTerritoryService(territoryRepository, logger);
    const updateService = new UpdateTerritoryService(territoryRepository, logger);

    // Instanciation des Contrôleurs
    const createController = new CreateTerritoryController(createService);
    const getController = new GetTerritoryController(getService);
    const deleteController = new DeleteTerritoryController(deleteService);
    const territoryController = new TerritoryController(getService, updateService, deleteService);

    // Toutes les routes de ce module nécessitent une authentification
    router.use(authMiddleware);

    // --- Routes de Lecture (GET) ---
    router.get('/hierarchy', (req, res) => getController.getHierarchy(req, res));
    router.get('/regions', (req, res) => getController.getRegions(req, res));
    router.get('/municipalities', (req, res) => getController.getMunicipalities(req, res));
    router.get('/districts', (req, res) => getController.getDistricts(req, res));
    router.get('/neighborhoods', (req, res) => getController.getNeighborhoods(req, res));
    router.get('/user-boundary', (req, res) => getController.getUserBoundary(req, res));
    router.get('/geojson/:level', (req, res) => getController.getGeoJson(req, res));
    router.get('/reverse-geocode', (req, res) => getController.reverseGeocode(req, res));

    // --- Routes d'Écriture (POST / PUT / DELETE) ---
    router.post(
        '/',
        requireRole(['super_admin', 'platform_admin', 'ministry']),
        (req, res) => createController.handle(req, res)
    );

    router.put(
        '/municipalities/:id',
        requireRole(['super_admin', 'platform_admin']),
        (req, res, next) => territoryController.updateMunicipality(req, res, next)
    );

    router.delete(
        '/:id',
        requireRole(['super_admin', 'platform_admin']),
        (req, res) => deleteController.handle(req, res)
    );

    return router;
};