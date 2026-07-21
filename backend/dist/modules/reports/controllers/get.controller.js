"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportController = void 0;
const zod_1 = require("zod");
const filtersSchema = zod_1.z.object({
    status: zod_1.z.string().optional(),
    issueCategory: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    riskLevel: zod_1.z.string().optional(),
    regionId: zod_1.z.string().optional(),
    municipalityId: zod_1.z.string().optional(),
    districtId: zod_1.z.string().optional(),
    neighborhoodId: zod_1.z.string().optional(),
    createdBy: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.string().default('created_at'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
class GetReportController {
    constructor(service) {
        this.service = service;
        this.getAll = async (req, res, next) => {
            try {
                const filters = filtersSchema.parse(req.query);
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
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const report = await this.service.byId(req.params.id);
                return res.status(200).json({ success: true, data: report });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetReportController = GetReportController;
//# sourceMappingURL=get.controller.js.map