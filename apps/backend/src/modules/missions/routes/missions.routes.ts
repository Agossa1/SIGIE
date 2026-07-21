import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, requireRole } from '../../../shared/middlewares/auth.middleware';
import { MissionsModule } from '../missions.module';
import PostgresDatabase from '../../../infra/database/postgres';

export const missionsRouter = (db: PostgresDatabase): Router => {
    const router = Router();
    const module = new MissionsModule(db);

    router.use(authMiddleware);

    // CRUD Missions
    router.get('/', (req: Request, res: Response, next: NextFunction) => module.services.get.controller.handle(req, res, next));
    router.post('/', requireRole(['super_admin', 'platform_admin', 'supervisor']), (req: Request, res: Response, next: NextFunction) => module.services.create.controller.handle(req, res, next));
    router.get('/:id', (req: Request, res: Response, next: NextFunction) => module.services.getById.controller.handle(req, res, next));
    router.put('/:id', requireRole(['super_admin', 'platform_admin', 'supervisor']), (req: Request, res: Response, next: NextFunction) => module.services.update.controller.handle(req, res, next));
    router.patch('/:id/status', (req: Request, res: Response, next: NextFunction) => module.services.updateStatus.controller.handle(req, res, next));

    // Assignation + Rapports
    router.post('/:id/assignments', requireRole(['super_admin', 'platform_admin']), (req: Request, res: Response, next: NextFunction) => module.services.assign.controller.handle(req, res, next));
    router.post('/:id/reports', (req: Request, res: Response, next: NextFunction) => module.services.report.controller.handle(req, res, next));

    return router;
};