import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { GisRepository } from './repositories/gis.repository';
import { GetAllGisLayersService } from './services/get-all.service';
import { GetGisLayerByIdService } from './services/get-by-id.service';
import { CreateGisLayerService } from './services/create.service';
import { DeleteGisLayerService } from './services/delete.service';
import { GetAllGisLayersController } from './controllers/get-all.controller';
import { GetGisLayerByIdController } from './controllers/get-by-id.controller';
import { CreateGisLayerController } from './controllers/create.controller';
import { DeleteGisLayerController } from './controllers/delete.controller';
import { configureGisRouter } from './routes/gis.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module GIS — Gestion des couches géographiques.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureGisRoutes(db: PostgresDatabase): Router {
    const repository = new GisRepository(db, logger);

    // Services
    const getAllService = new GetAllGisLayersService(repository);
    const getByIdService = new GetGisLayerByIdService(repository);
    const createService = new CreateGisLayerService(repository);
    const deleteService = new DeleteGisLayerService(repository);

    // Controllers
    const getAllCtrl = new GetAllGisLayersController(getAllService);
    const getByIdCtrl = new GetGisLayerByIdController(getByIdService);
    const createCtrl = new CreateGisLayerController(createService);
    const deleteCtrl = new DeleteGisLayerController(deleteService);

    // Routes
    return configureGisRouter(getAllCtrl, getByIdCtrl, createCtrl, deleteCtrl);
}