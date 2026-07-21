"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionsStatsService = void 0;
class InterventionsStatsService {
    constructor(repository) {
        this.repository = repository;
    }
    async getStats(filters) {
        const result = await this.repository.getStats(filters || {});
        return {
            total: parseInt(String(result.stats?.total || 0)),
            inProgress: parseInt(String(result.stats?.inProgress || 0)),
            completedToday: parseInt(String(result.stats?.completedToday || 0)),
            averageResolutionHours: parseFloat(String(result.stats?.averageResolutionHours || 0)),
            byType: result.byType,
            byMunicipality: result.byMunicipality,
        };
    }
}
exports.InterventionsStatsService = InterventionsStatsService;
//# sourceMappingURL=stats.service.js.map