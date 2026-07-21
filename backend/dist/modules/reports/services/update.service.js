"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReportService = void 0;
const redis_service_1 = require("../../../config/redis/redis.service");
class UpdateReportService {
    constructor(repository) {
        this.repository = repository;
    }
    async executeStatusUpdate(id, status) {
        // Mise à jour BDD
        await this.repository.updateReportStatus(id, status);
        // Invalide le cache de la liste ET le cache du rapport individuel
        await Promise.all([
            redis_service_1.redisService.del('reports:all'),
            redis_service_1.redisService.del(`reports:${id}`),
        ]);
    }
}
exports.UpdateReportService = UpdateReportService;
//# sourceMappingURL=update.service.js.map