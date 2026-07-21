import { Request, Response, NextFunction } from 'express';
import { UpdateReportService } from '../services/update';
import { updateReportSchema, UpdateReportDTO } from '../validations/update.validations';
import { UnauthorizedError } from '../../../shared/errors/appErrors';

export class UpdateReportController {
    constructor(private readonly service: UpdateReportService) {}

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user?.id) throw new UnauthorizedError();
            const dto = updateReportSchema.parse(req.body) as UpdateReportDTO;
            const report = await this.service.execute(req.params.id as string, dto, user.id);
            return res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    };
}