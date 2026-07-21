import { Router } from 'express';
import { authMiddleware, requireRole } from '../../../shared/middlewares/auth.middleware';
import { GetAllGisLayersController } from '../controllers/get-all.controller';
import { GetGisLayerByIdController } from '../controllers/get-by-id.controller';
import { CreateGisLayerController } from '../controllers/create.controller';
import { DeleteGisLayerController } from '../controllers/delete.controller';

export function configureGisRouter(
    getAllCtrl: GetAllGisLayersController,
    getByIdCtrl: GetGisLayerByIdController,
    createCtrl: CreateGisLayerController,
    deleteCtrl: DeleteGisLayerController,
): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/', getAllCtrl.handle);
    router.get('/:id/geojson', getByIdCtrl.handle);
    router.post('/', requireRole(['super_admin', 'platform_admin']), createCtrl.handle);
    router.delete('/:id', requireRole(['super_admin', 'platform_admin']), deleteCtrl.handle);

    return router;
}