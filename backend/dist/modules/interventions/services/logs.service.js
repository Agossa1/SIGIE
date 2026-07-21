"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionLogsService = void 0;
class InterventionLogsService {
    constructor(repository) {
        this.repository = repository;
    }
    async getLogs(interventionId) {
        return this.repository.getLogsByInterventionId(interventionId);
    }
    async log(dto) {
        return this.repository.addLog(dto);
    }
}
exports.InterventionLogsService = InterventionLogsService;
//# sourceMappingURL=logs.service.js.map