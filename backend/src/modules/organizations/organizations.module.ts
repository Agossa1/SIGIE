import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { OrganizationsRepository } from './repositories/organizations.repository';
import { GetAllOrganizationsService } from './services/get-all.service';
import { GetOrganizationByIdService } from './services/get-by-id.service';
import { CreateOrganizationService } from './services/create.service';
import { UpdateOrganizationService } from './services/update.service';
import { DeleteOrganizationService } from './services/delete.service';
import { GetAllOrganizationsController } from './controllers/get-all.controller';
import { GetOrganizationByIdController } from './controllers/get-by-id.controller';
import { CreateOrganizationController } from './controllers/create.controller';
import { UpdateOrganizationController } from './controllers/update.controller';
import { DeleteOrganizationController } from './controllers/delete.controller';
import { configureOrganizationsRouter } from './routes/organizations.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module Organizations — Gestion des entités de rattachement.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureOrganizationsRoutes(db: PostgresDatabase): Router {
    const repository = new OrganizationsRepository(db, logger);

    // Services
    const getAllService = new GetAllOrganizationsService(repository);
    const getByIdService = new GetOrganizationByIdService(repository);
    const createService = new CreateOrganizationService(repository);
    const updateService = new UpdateOrganizationService(repository);
    const deleteService = new DeleteOrganizationService(repository);

    // Controllers
    const getAllCtrl = new GetAllOrganizationsController(getAllService);
    const getByIdCtrl = new GetOrganizationByIdController(getByIdService);
    const createCtrl = new CreateOrganizationController(createService);
    const updateCtrl = new UpdateOrganizationController(updateService);
    const deleteCtrl = new DeleteOrganizationController(deleteService);

    // Routes
    return configureOrganizationsRouter(getAllCtrl, getByIdCtrl, createCtrl, updateCtrl, deleteCtrl);
}