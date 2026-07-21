"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFieldOpsSummaryService = void 0;
const territorialFilter_middleware_1 = require("../../../shared/middlewares/territorialFilter.middleware");
class GetFieldOpsSummaryService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(user) {
        const filters = user ? (0, territorialFilter_middleware_1.applyTerritorialFilter)(user) : {};
        const stats = await this.repository.getSummary(filters);
        return {
            missions: {
                active: parseInt(stats?.active_missions || '0'),
                planned: parseInt(stats?.planned_missions || '0'),
                completedToday: parseInt(stats?.completed_today || '0'),
                total: parseInt(stats?.total_missions || '0'),
            },
            reports: {
                pending: parseInt(stats?.pending_reports || '0'),
                resolved: parseInt(stats?.resolved_reports || '0'),
                critical: parseInt(stats?.critical_reports || '0'),
                total: parseInt(stats?.total_reports || '0'),
            },
            interventions: {
                active: parseInt(stats?.active_interventions || '0'),
                total: parseInt(stats?.total_interventions || '0'),
            },
            teams: {
                active: parseInt(stats?.active_teams || '0'),
                total: parseInt(stats?.total_teams || '0'),
            },
        };
    }
}
exports.GetFieldOpsSummaryService = GetFieldOpsSummaryService;
//# sourceMappingURL=summary.service.js.map