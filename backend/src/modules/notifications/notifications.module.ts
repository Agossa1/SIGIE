import { Router, Request, Response, NextFunction } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

export function configureNotificationsRoutes(db: PostgresDatabase): Router {
    const router = Router();
    router.use(authMiddleware);

    router.get('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
            const offset = parseInt(req.query.offset as string) || 0;

            const result = await db.query(
                `SELECT id, type, title, body, data, is_read, created_at
                 FROM notifications
                 WHERE user_id = $1
                 ORDER BY created_at DESC
                 LIMIT $2 OFFSET $3`,
                [userId, limit, offset]
            );

            const countResult = await db.query(
                `SELECT count(*) as total, count(*) FILTER (WHERE NOT is_read) as unread
                 FROM notifications WHERE user_id = $1`,
                [userId]
            );

            res.json({
                success: true,
                data: result.rows,
                unread: parseInt(countResult.rows[0]?.unread || '0'),
                total: parseInt(countResult.rows[0]?.total || '0'),
            });
        } catch (error) {
            next(error);
        }
    });

    router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            await db.query(
                `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
                [req.params.id, userId]
            );
            res.json({ success: true, message: 'Notification marquée comme lue' });
        } catch (error) {
            next(error);
        }
    });

    router.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            await db.query(
                `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
                [userId]
            );
            res.json({ success: true, message: 'Toutes les notifications marquées comme lues' });
        } catch (error) {
            next(error);
        }
    });

    return router;
}

export async function createNotification(
    db: PostgresDatabase,
    userId: string,
    type: string,
    title: string,
    body: string,
    data: Record<string, any> = {}
): Promise<void> {
    try {
        await db.query(
            `INSERT INTO notifications (user_id, type, title, body, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, type, title, body, JSON.stringify(data)]
        );
    } catch (error) {
        console.error('[Notifications] Error creating notification:', error);
    }
}