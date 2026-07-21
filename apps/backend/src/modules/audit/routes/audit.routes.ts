import { Router } from 'express';
import { authMiddleware, requireRole } from '../../../shared/middlewares/auth.middleware';
import { GetAllAuditLogsController } from '../controllers/get-all.controller';

export function configureAuditRouter(getAllCtrl: GetAllAuditLogsController): Router {
    const router = Router();
    router.use(authMiddleware);
    router.use(requireRole(['super_admin', 'platform_admin']));

    router.get('/', getAllCtrl.handle);

    return router;
}