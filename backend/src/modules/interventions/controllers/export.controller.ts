import { Request, Response, NextFunction } from 'express';
import { InterventionsExportService } from '../services/export.service';

export class ExportInterventionsCSVController {
    constructor(private readonly service: InterventionsExportService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { municipalityId, dateFrom, dateTo, status } = req.query;
            const csv = await this.service.exportCSV({
                municipalityId: municipalityId as string,
                dateFrom: dateFrom as string,
                dateTo: dateTo as string,
                status: status as string,
            });

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="interventions-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        } catch (e) { next(e); }
    };
}