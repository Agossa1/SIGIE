import { Request, Response, NextFunction } from 'express';
import { AssignReportService } from '../services/assign';
import { createAssignmentSchema } from '../validations/assign.validations';
import { UnauthorizedError } from '../../../shared/errors/appErrors';

export class AssignReportController {
    constructor(private readonly service: AssignReportService) {}

    assign = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user?.id) throw new UnauthorizedError();
            const dto = createAssignmentSchema.parse(req.body);
            const report = await this.service.execute(req.params.id as string, user.id, dto);
            return res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    };
}