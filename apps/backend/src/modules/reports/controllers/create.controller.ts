import { Request, Response, NextFunction } from 'express';
import { CreateReportService } from '../services/create';
import { createReportSchema } from '../validations/create.validations';
import { UnauthorizedError } from '../../../shared/errors/appErrors';

export class CreateReportController {
    constructor(private readonly service: CreateReportService) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user?.id) throw new UnauthorizedError();
            const dto = createReportSchema.parse(req.body);
            const report = await this.service.execute(dto, user.id);
            return res.status(201).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    };
}