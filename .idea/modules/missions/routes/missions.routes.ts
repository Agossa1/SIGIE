import { Router } from 'express';
import { 
    createMissionController, 
    getMissionsController, 
    updateMissionStatusController,
    getMissionByIdController,
    updateMissionController,
    assignMissionController,
    addMissionReportController
} from '../controllers/missions.controller';
import { MissionsRepository } from '../repositories/missions.repository';
import { CreateMissionService } from '../services/create.service';
import { GetMissionsService } from '../services/get.service';
import { UpdateMissionService } from '../services/update.service';
import { GetMissionByIdService } from '../services/get-by-id.service';
import { AssignMissionService } from '../services/assign.service';
import { AddMissionReportService } from '../services/report.service';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { createLogger, format, transports } from 'winston';
import { authMiddleware, requireRole } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';

export const missionsRouter = (db: PostgresDatabase) => {
    const router = Router();

    const logger = createLogger({
        format: format.simple(),
        transports: [new transports.Console()],
    });

    const repository = new MissionsRepository(db, logger);
    const createService = new CreateMissionService(repository);
    const getService = new GetMissionsService(repository);
    const updateService = new UpdateMissionService(repository);
    const getByIdService = new GetMissionByIdService(repository);
    const assignService = new AssignMissionService(repository);
    const reportService = new AddMissionReportService(repository);

    // Get all missions
    router.get('/', authMiddleware, getMissionsController(getService));

    // Get mission by ID
    router.get('/:id', authMiddleware, getMissionByIdController(getByIdService));

    // Create mission
    router.post(
        '/',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor']),
        createMissionController(createService)
    );

    // Update mission (general details)
    router.patch(
        '/:id',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor']),
        updateMissionController(updateService)
    );

    // Update mission status
    router.patch(
        '/:id/status',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor', 'field_agent']),
        updateMissionStatusController(updateService)
    );

    // Assign users to mission
    router.post(
        '/:id/assignments',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor']),
        assignMissionController(assignService)
    );

    // Add a mission report
    router.post(
        '/:id/reports',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor', 'field_agent']),
        addMissionReportController(reportService)
    );

    // ─── Checklist CRUD ───────────────────────────────────────────────────────

    // Get checklist for a mission
    router.get('/:id/checklist', authMiddleware, async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await db.query(
                `SELECT id, mission_id as "missionId", label, done, done_by as "doneBy", done_at as "doneAt", created_at as "createdAt", "order"
                 FROM mission_checklist WHERE mission_id = $1 ORDER BY "order" ASC`,
                [id]
            );
            res.json({ success: true, data: result.rows });
        } catch (err) { next(err); }
    });

    // Add checklist item
    router.post('/:id/checklist', authMiddleware, requireRole(['super_admin', 'platform_admin', 'supervisor']), async (req, res, next) => {
        try {
            const { id } = req.params;
            const { label, order } = req.body;
            const result = await db.query(
                `INSERT INTO mission_checklist (mission_id, label, "order") VALUES ($1, $2, $3) RETURNING *`,
                [id, label, order ?? 0]
            );
            res.status(201).json({ success: true, data: result.rows[0] });
        } catch (err) { next(err); }
    });

    // Toggle checklist item (done/undone)
    router.patch('/:id/checklist/:itemId', authMiddleware, async (req, res, next) => {
        try {
            const { itemId } = req.params;
            const userId = (req as any).user!.id;
            const result = await db.query(
                `UPDATE mission_checklist
                 SET done = NOT done,
                     done_by = CASE WHEN NOT done THEN $1 ELSE NULL END,
                     done_at = CASE WHEN NOT done THEN NOW() ELSE NULL END
                 WHERE id = $2 RETURNING *`,
                [userId, itemId]
            );
            res.json({ success: true, data: result.rows[0] });
        } catch (err) { next(err); }
    });

    // Delete checklist item
    router.delete('/:id/checklist/:itemId', authMiddleware, requireRole(['super_admin', 'platform_admin', 'supervisor']), async (req, res, next) => {
        try {
            const { itemId } = req.params;
            await db.query(`DELETE FROM mission_checklist WHERE id = $1`, [itemId]);
            res.json({ success: true, data: null });
        } catch (err) { next(err); }
    });

    return router;
};
