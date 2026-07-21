import { Request, Response, NextFunction } from 'express';
import { CommentReportService } from '../services/comment';
import { createCommentSchema } from '../validations/comment.validations';
import { UnauthorizedError } from '../../../shared/errors/appErrors';

export class CommentReportController {
    constructor(private readonly service: CommentReportService) {}

    addComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user?.id) throw new UnauthorizedError();
            const dto = createCommentSchema.parse(req.body);
            const comment = await this.service.execute(req.params.id as string, user.id, dto);
            return res.status(201).json({ success: true, data: comment });
        } catch (error) {
            next(error);
        }
    };
}