import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { InfrastructureRepository } from './repositories/infrastructure.repository';
import { GetAllInfrastructureService } from './services/get-all.service';
import { GetInfrastructureByIdService } from './services/get-by-id.service';
import { CreateInfrastructureService } from './services/create.service';
import { UpdateInfrastructureService } from './services/update.service';
import { DeleteInfrastructureService } from './services/delete.service';
import { GetAllInfrastructureController } from './controllers/get-all.controller';
import { GetInfrastructureByIdController } from './controllers/get-by-id.controller';
import { CreateInfrastructureController } from './controllers/create.controller';
import { UpdateInfrastructureController } from './controllers/update.controller';
import { DeleteInfrastructureController } from './controllers/delete.controller';
import { configureInfrastructureRouter } from './routes/infrastructure.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module Infrastructure — Gestion des ouvrages physiques.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureInfrastructureRoutes(db: PostgresDatabase): Router {
    const repository = new InfrastructureRepository(db, logger);

    // Services
    const getAllService = new GetAllInfrastructureService(repository);
    const getByIdService = new GetInfrastructureByIdService(repository);
    const createService = new CreateInfrastructureService(repository);
    const updateService = new UpdateInfrastructureService(repository);
    const deleteService = new DeleteInfrastructureService(repository);

    // Controllers
    const getAllCtrl = new GetAllInfrastructureController(getAllService);
    const getByIdCtrl = new GetInfrastructureByIdController(getByIdService);
    const createCtrl = new CreateInfrastructureController(createService);
    const updateCtrl = new UpdateInfrastructureController(updateService);
    const deleteCtrl = new DeleteInfrastructureController(deleteService);

    // Routes
    return configureInfrastructureRouter(getAllCtrl, getByIdCtrl, createCtrl, updateCtrl, deleteCtrl);
}