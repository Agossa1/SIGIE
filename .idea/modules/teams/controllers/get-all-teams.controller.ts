import { Request, Response, NextFunction } from 'express';
import { GetOrganizationTeamsService } from '../services/get-organization-teams.service';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

import { TeamMapper } from '../mappers/team.mapper';

export class GetAllTeamsController {
    constructor(private readonly getTeamsService: GetOrganizationTeamsService) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orgId = (req as any).user?.organizationId;
            
            // Si pas d'orgId (ex: Super Admin ou utilisateur non assigné), 
            // on retourne un tableau vide plutôt que de crasher l'app avec une 400
            if (!orgId) {
                return res.json({ success: true, data: [] });
            }
            
            const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
            const search = req.query.search as string;

            if (page && limit) {
                const result = await this.getTeamsService.executePaginated(orgId, page, limit, search);
                return res.json({
                    success: true,
                    data: result.data.map(team => TeamMapper.toDTO(team)),
                    meta: {
                        total: result.total,
                        page,
                        limit
                    }
                });
            } else {
                const teams = await this.getTeamsService.execute(orgId);
                return res.json({
                    success: true,
                    data: teams.map(team => TeamMapper.toDTO(team))
                });
            }
        } catch (error) {
            next(error);
        }
    };
}