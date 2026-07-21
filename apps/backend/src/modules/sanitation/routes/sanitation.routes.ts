import { Router } from 'express';
import { authMiddleware, requireRole } from '../../../shared/middlewares/auth.middleware';
import { GetWastePointsController } from '../controllers/get-waste-points.controller';
import { CreateWastePointController } from '../controllers/create-waste-point.controller';
import { GetCollectionsController } from '../controllers/get-collections.controller';
import { CreateCollectionController } from '../controllers/create-collection.controller';
import { GetCampaignsController } from '../controllers/get-campaigns.controller';

export function configureSanitationRouter(
    getWastePointsCtrl: GetWastePointsController,
    createWastePointCtrl: CreateWastePointController,
    getCollectionsCtrl: GetCollectionsController,
    createCollectionCtrl: CreateCollectionController,
    getCampaignsCtrl: GetCampaignsController,
): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/points', getWastePointsCtrl.handle);
    router.post('/points', requireRole(['super_admin', 'platform_admin', 'sgds_manager']), createWastePointCtrl.handle);
    router.get('/collections', getCollectionsCtrl.handle);
    router.post('/collections', requireRole(['super_admin', 'platform_admin', 'sgds_manager']), createCollectionCtrl.handle);
    router.get('/campaigns', getCampaignsCtrl.handle);

    return router;
}