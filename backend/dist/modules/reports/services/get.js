"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const territorialFilter_middleware_1 = require("../../../shared/middlewares/territorialFilter.middleware");
class GetReportService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async getAll(filters, user) {
        // 🔐 Filtrage territorial centralisé
        if (user) {
            const territorialFilters = (0, territorialFilter_middleware_1.applyTerritorialFilter)(user);
            Object.assign(filters, territorialFilters);
        }
        // Cache Redis bypass temporaire pour forcer le refresh
        // const cacheKey = `reports:list:${JSON.stringify({ ...filters, page: undefined, limit: undefined })}`;
        // return redisCache.getOrSet(cacheKey, () => this.repository.getReports(filters), 120);
        return this.repository.getReports(filters);
    }
    async byId(id) {
        const report = await this.repository.getReportById(id);
        if (!report)
            throw new appErrors_1.NotFoundError('Signalement non trouvé');
        report.comments = await this.repository.getComments(id);
        return report;
    }
}
exports.GetReportService = GetReportService;
//# sourceMappingURL=get.js.map