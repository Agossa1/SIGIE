import { Router } from 'express';
import { GetReportCategoriesController } from '../controllers/report-categories.controller';

export function configureStubsRouter(reportCategoriesCtrl: GetReportCategoriesController): Router {
    const router = Router();

    const emptyList = (_req: any, res: any) => res.json({ success: true, data: [] });
    const emptyObj = (_req: any, res: any) => res.json({ success: true, data: {} });

    // Analytics (pas encore de module dédié)
    router.get('/analytics', emptyObj);

    // Media (pas encore de module dédié)
    router.get('/media', emptyList);

    // Report categories
    router.get('/report-categories', reportCategoriesCtrl.handle);

    // Catch-all pour éviter les 404 sur les routes non migrées
    router.use((_req: any, res: any) => {
        res.json({ success: true, data: [] });
    });

    return router;
}