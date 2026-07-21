import { Request, Response, NextFunction } from 'express';
import { GetAllTeamsService } from '../services/get-all-teams.service';

export class GetAllTeamsController {
    constructor(private readonly service: GetAllTeamsService) {}

    handle = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const teams = await this.service.execute();
            res.json({ success: true, data: teams });
        } catch (error) {
            next(error);
        }
    };
}