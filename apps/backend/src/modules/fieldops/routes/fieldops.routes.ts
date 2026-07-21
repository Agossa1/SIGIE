import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { GetFieldOpsSummaryController } from '../controllers/get-summary.controller';

export function configureFieldOpsRouter(summaryCtrl: GetFieldOpsSummaryController): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/summary', summaryCtrl.handle);

    return router;
}