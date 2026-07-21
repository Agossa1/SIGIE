import { Router } from 'express';
import { authMiddleware, requireRole } from '../../../shared/middlewares/auth.middleware';
import { GetAllInfrastructureController } from '../controllers/get-all.controller';
import { GetInfrastructureByIdController } from '../controllers/get-by-id.controller';
import { CreateInfrastructureController } from '../controllers/create.controller';
import { UpdateInfrastructureController } from '../controllers/update.controller';
import { DeleteInfrastructureController } from '../controllers/delete.controller';

export function configureInfrastructureRouter(
    getAllCtrl: GetAllInfrastructureController,
    getByIdCtrl: GetInfrastructureByIdController,
    createCtrl: CreateInfrastructureController,
    updateCtrl: UpdateInfrastructureController,
    deleteCtrl: DeleteInfrastructureController,
): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/', getAllCtrl.handle);
    router.get('/:id', getByIdCtrl.handle);
    router.post('/', requireRole(['super_admin', 'platform_admin', 'dst_manager']), createCtrl.handle);
    router.put('/:id', requireRole(['super_admin', 'platform_admin', 'dst_manager']), updateCtrl.handle);
    router.delete('/:id', requireRole(['super_admin', 'platform_admin']), deleteCtrl.handle);

    return router;
}