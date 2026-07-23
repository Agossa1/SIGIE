import { Request, Response, NextFunction } from 'express';
import { InterventionsExportService } from '../services/export.service';
import { applyTerritorialFilter } from '../../../shared/middlewares/territorialFilter.middleware';

export class ExportInterventionsCSVController {
    constructor(private readonly service: InterventionsExportService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { municipalityId, dateFrom, dateTo, status } = req.query;

            const user = (req as any).user;
            const territorialFilters: any = user ? applyTerritorialFilter(user) : {};
            
            const roles = user?.roles || [];
            if (roles.includes('sgds_manager') || roles.includes('agent_sgds')) {
                territorialFilters.assignedService = 'sgds';
            } else if (roles.includes('dst_manager') || roles.includes('agent_dst')) {
                territorialFilters.assignedService = 'dst';
            }

            const filters = {
                municipalityId: municipalityId ? String(municipalityId) : territorialFilters.municipalityId,
                dateFrom: dateFrom as string,
                dateTo: dateTo as string,
                status: status as string,
                regionId: territorialFilters.regionId,
                assignedService: territorialFilters.assignedService,
            };

            const csv = await this.service.exportCSV(filters);

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="interventions-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        } catch (e) { next(e); }
    };
}