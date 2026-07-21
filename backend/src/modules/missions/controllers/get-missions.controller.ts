import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../../shared/errors/appErrors';
import { GetMissionsService } from '../services/get.service';
import type { TokenPayload } from '../../auth/types/auth.types';

export class GetMissionsController {
    constructor(private readonly service: GetMissionsService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user;
            if (!user || !user.id) throw new UnauthorizedError();
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const result = await this.service.execute(user.id, user.roles, user, page, limit);
            res.status(200).json({
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                },
                message: 'Missions récupérées'
            });
        } catch (error) { next(error); }
    };
}