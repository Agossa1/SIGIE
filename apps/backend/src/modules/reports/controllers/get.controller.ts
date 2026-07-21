import { Request, Response, NextFunction } from 'express';
import { GetReportService } from '../services/get';
import { ReportFilters } from '../types/reports.types';
import { z } from 'zod';

const filtersSchema = z.object({
    status: z.string().optional(),
    issueCategory: z.string().optional(),
    priority: z.string().optional(),
    riskLevel: z.string().optional(),
    regionId: z.string().optional(),
    municipalityId: z.string().optional(),
    districtId: z.string().optional(),
    neighborhoodId: z.string().optional(),
    createdBy: z.string().optional(),
    assignedTo: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class GetReportController {
    constructor(private readonly service: GetReportService) {}

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters = filtersSchema.parse(req.query) as ReportFilters;
            const user = req.user;
            const result = await this.service.getAll(filters, user);
            return res.status(200).json({ 
                success: true, 
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const report = await this.service.byId(req.params.id as string);
            return res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    };
}