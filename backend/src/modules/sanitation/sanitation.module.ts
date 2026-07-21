import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { SanitationRepository } from './repositories/sanitation.repository';
import { GetWastePointsService } from './services/get-waste-points.service';
import { CreateWastePointService } from './services/create-waste-point.service';
import { GetCollectionsService } from './services/get-collections.service';
import { CreateCollectionService } from './services/create-collection.service';
import { GetCampaignsService } from './services/get-campaigns.service';
import { GetWastePointsController } from './controllers/get-waste-points.controller';
import { CreateWastePointController } from './controllers/create-waste-point.controller';
import { GetCollectionsController } from './controllers/get-collections.controller';
import { CreateCollectionController } from './controllers/create-collection.controller';
import { GetCampaignsController } from './controllers/get-campaigns.controller';
import { configureSanitationRouter } from './routes/sanitation.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module Sanitation — Gestion de la salubrité, collectes, points de déchets, campagnes.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureSanitationRoutes(db: PostgresDatabase): Router {
    const repository = new SanitationRepository(db, logger);

    // Services
    const getWastePointsService = new GetWastePointsService(repository);
    const createWastePointService = new CreateWastePointService(repository);
    const getCollectionsService = new GetCollectionsService(repository);
    const createCollectionService = new CreateCollectionService(repository);
    const getCampaignsService = new GetCampaignsService(repository);

    // Controllers
    const getWastePointsCtrl = new GetWastePointsController(getWastePointsService);
    const createWastePointCtrl = new CreateWastePointController(createWastePointService);
    const getCollectionsCtrl = new GetCollectionsController(getCollectionsService);
    const createCollectionCtrl = new CreateCollectionController(createCollectionService);
    const getCampaignsCtrl = new GetCampaignsController(getCampaignsService);

    // Routes
    return configureSanitationRouter(
        getWastePointsCtrl,
        createWastePointCtrl,
        getCollectionsCtrl,
        createCollectionCtrl,
        getCampaignsCtrl,
    );
}