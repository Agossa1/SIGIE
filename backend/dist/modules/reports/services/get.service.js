"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportService = void 0;
const redis_service_1 = require("../../../config/redis/redis.service");
const territoryScope_1 = require("../../../shared/territory/territoryScope");
class GetReportService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Récupère les rapports visibles pour le périmètre territorial de l'utilisateur (Redis-cached).
     */
    async execute(scopeInput) {
        const scope = (0, territoryScope_1.resolveTerritoryScope)(scopeInput ?? {});
        const CACHE_KEY = `reports:${(0, territoryScope_1.territoryScopeCacheKey)(scope)}`;
        const cached = await redis_service_1.redisService.get(CACHE_KEY);
        if (cached)
            return cached;
        const reports = await this.repository.getReports(scope);
        await redis_service_1.redisService.set(CACHE_KEY, reports, 3600);
        return reports;
    }
    /**
     * Récupère un rapport unique par son ID (Redis-cached par ID).
     */
    async executeById(id) {
        const CACHE_KEY = `reports:${id}`;
        // 1. Interrogation du cache Redis
        const cached = await redis_service_1.redisService.get(CACHE_KEY);
        if (cached)
            return cached;
        // 2. Cache Miss → base de données
        const report = await this.repository.getReportById(id);
        if (!report)
            return null;
        // 3. Mise en cache du rapport individuel pour 15 minutes
        await redis_service_1.redisService.set(CACHE_KEY, report, 900);
        return report;
    }
}
exports.GetReportService = GetReportService;
//# sourceMappingURL=get.service.js.map