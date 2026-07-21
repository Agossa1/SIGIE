import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { GetAllTeamsController } from '../controllers/get-all.controller';
import { GetTeamMembersController } from '../controllers/get-members.controller';

export function configureTeamsRouter(
    getAllCtrl: GetAllTeamsController,
    getMembersCtrl: GetTeamMembersController,
): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/', getAllCtrl.handle);
    router.get('/:id/members', getMembersCtrl.handle);

    return router;
}