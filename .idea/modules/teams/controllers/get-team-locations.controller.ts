import { Request, Response, NextFunction } from 'express';
import { TeamRepository } from '../repositories/team.repository';

export class GetTeamLocationsController {
    constructor(private readonly teamRepository: TeamRepository) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const locations = await this.teamRepository.getLatestTeamLocations();
            return res.json({
                success: true,
                data: locations
            });
        } catch (error) {
            next(error);
        }
    };
}
