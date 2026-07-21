import { Request, Response, NextFunction } from 'express';
import { DeleteReportService } from '../services/delete';
import { UnauthorizedError } from '../../../shared/errors/appErrors';

export class DeleteReportController {
    constructor(private readonly service: DeleteReportService) {}

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user?.id) throw new UnauthorizedError();
            await this.service.execute(req.params.id as string, user.id);
            return res.status(200).json({ success: true, message: 'Signalement supprimé' });
        } catch (error) {
            next(error);
        }
    };
}