import { Request, Response, NextFunction } from 'express';
import { InterventionsStatsService } from '../services/stats.service';
import { applyTerritorialFilter } from '../../../shared/middlewares/territorialFilter.middleware';

export class GetInterventionsStatsController {
    constructor(private readonly service: InterventionsStatsService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { municipalityId, dateFrom, dateTo } = req.query;
            
            const user = (req as any).user;
            const territorialFilters: any = user ? applyTerritorialFilter(user) : {};
            
            const roles = user?.roles || [];
            if (roles.includes('sgds_manager') || roles.includes('agent_sgds')) {
                territorialFilters.assignedService = 'sgds';
            } else if (roles.includes('dst_manager') || roles.includes('agent_dst')) {
                territorialFilters.assignedService = 'dst';
            }
            
            // On fusionne les query params (ex: si l'admin filtre manuellement) avec les règles de sécurité
            const filters = {
                municipalityId: municipalityId ? String(municipalityId) : territorialFilters.municipalityId,
                dateFrom: dateFrom as string,
                dateTo: dateTo as string,
                regionId: territorialFilters.regionId,
                assignedService: territorialFilters.assignedService,
            };

            const stats = await this.service.getStats(filters);
            res.json({ success: true, data: stats });
        } catch (e) { next(e); }
    };
}