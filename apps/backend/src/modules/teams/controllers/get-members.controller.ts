import { Request, Response, NextFunction } from 'express';
import { GetTeamMembersService } from '../services/get-team-members.service';

export class GetTeamMembersController {
    constructor(private readonly service: GetTeamMembersService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const members = await this.service.execute(String(req.params.id));
            res.json({ success: true, data: members });
        } catch (error) {
            next(error);
        }
    };
}