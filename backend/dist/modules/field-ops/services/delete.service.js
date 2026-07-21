"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteReportService = void 0;
const redis_service_1 = require("../../../config/redis/redis.service");
class DeleteReportService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        // Soft delete en BDD
        await this.repository.deleteReport(id);
        // Invalide le cache de la liste ET le cache du rapport individuel
        await Promise.all([
            redis_service_1.redisService.del('fieldops:reports:all'),
            redis_service_1.redisService.del(`fieldops:reports:${id}`),
        ]);
    }
}
exports.DeleteReportService = DeleteReportService;
//# sourceMappingURL=delete.service.js.map