import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { TerritoryRepository } from './repositories/territory.repository';
import { GetRegionsService } from './services/get-regions.service';
import { GetMunicipalitiesService } from './services/get-municipalities.service';
import { GetDistrictsService } from './services/get-districts.service';
import { GetNeighborhoodsService } from './services/get-neighborhoods.service';
import { GetRegionsController } from './controllers/get-regions.controller';
import { GetMunicipalitiesController } from './controllers/get-municipalities.controller';
import { GetDistrictsController } from './controllers/get-districts.controller';
import { GetNeighborhoodsController } from './controllers/get-neighborhoods.controller';
import { configureTerritoryRouter } from './routes/territory.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module Territory — Découpage administratif du Bénin.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureTerritoryRoutes(db: PostgresDatabase): Router {
    const repository = new TerritoryRepository(db, logger);

    // Services
    const getRegionsService = new GetRegionsService(repository);
    const getMunicipalitiesService = new GetMunicipalitiesService(repository);
    const getDistrictsService = new GetDistrictsService(repository);
    const getNeighborhoodsService = new GetNeighborhoodsService(repository);

    // Controllers
    const getRegionsCtrl = new GetRegionsController(getRegionsService);
    const getMunicipalitiesCtrl = new GetMunicipalitiesController(getMunicipalitiesService);
    const getDistrictsCtrl = new GetDistrictsController(getDistrictsService);
    const getNeighborhoodsCtrl = new GetNeighborhoodsController(getNeighborhoodsService);

    // Routes
    return configureTerritoryRouter(getRegionsCtrl, getMunicipalitiesCtrl, getDistrictsCtrl, getNeighborhoodsCtrl);
}