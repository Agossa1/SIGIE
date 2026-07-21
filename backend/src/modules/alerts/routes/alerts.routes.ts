import { Router } from 'express';
import { authMiddleware, requireRole } from '../../../shared/middlewares/auth.middleware';
import { GetAllAlertsController } from '../controllers/get-all.controller';
import { CreateAlertController } from '../controllers/create.controller';
import { AcknowledgeAlertController } from '../controllers/acknowledge.controller';

export function configureAlertsRouter(
    getAllCtrl: GetAllAlertsController,
    createCtrl: CreateAlertController,
    acknowledgeCtrl: AcknowledgeAlertController,
): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/', getAllCtrl.handle);
    router.post('/', requireRole(['super_admin', 'platform_admin', 'ministry', 'prefecture_director']), createCtrl.handle);
    router.patch('/:id/acknowledge', acknowledgeCtrl.handle);

    return router;
}