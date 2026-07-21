import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { GetRegionsController } from '../controllers/get-regions.controller';
import { GetMunicipalitiesController } from '../controllers/get-municipalities.controller';
import { GetDistrictsController } from '../controllers/get-districts.controller';
import { GetNeighborhoodsController } from '../controllers/get-neighborhoods.controller';

export function configureTerritoryRouter(
    getRegionsCtrl: GetRegionsController,
    getMunicipalitiesCtrl: GetMunicipalitiesController,
    getDistrictsCtrl: GetDistrictsController,
    getNeighborhoodsCtrl: GetNeighborhoodsController,
): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/regions', getRegionsCtrl.handle);
    router.get('/municipalities', getMunicipalitiesCtrl.handle);
    router.get('/districts', getDistrictsCtrl.handle);
    router.get('/neighborhoods', getNeighborhoodsCtrl.handle);

    return router;
}