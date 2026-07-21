import { Router } from 'express';
import { authMiddleware, requireRole } from '../../../shared/middlewares/auth.middleware';
import { GetAllOrganizationsController } from '../controllers/get-all.controller';
import { GetOrganizationByIdController } from '../controllers/get-by-id.controller';
import { CreateOrganizationController } from '../controllers/create.controller';
import { UpdateOrganizationController } from '../controllers/update.controller';
import { DeleteOrganizationController } from '../controllers/delete.controller';

export function configureOrganizationsRouter(
    getAllCtrl: GetAllOrganizationsController,
    getByIdCtrl: GetOrganizationByIdController,
    createCtrl: CreateOrganizationController,
    updateCtrl: UpdateOrganizationController,
    deleteCtrl: DeleteOrganizationController,
): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/', getAllCtrl.handle);
    router.get('/:id', getByIdCtrl.handle);
    router.post('/', requireRole(['super_admin', 'platform_admin']), createCtrl.handle);
    router.put('/:id', requireRole(['super_admin', 'platform_admin']), updateCtrl.handle);
    router.delete('/:id', requireRole(['super_admin', 'platform_admin']), deleteCtrl.handle);

    return router;
}