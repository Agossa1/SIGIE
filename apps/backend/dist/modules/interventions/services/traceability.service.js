"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionsTraceabilityService = void 0;
class InterventionsTraceabilityService {
    constructor(repository) {
        this.repository = repository;
    }
    async getTraceabilityByReport(reportId) {
        return this.repository.getTraceabilityByReport(reportId);
    }
}
exports.InterventionsTraceabilityService = InterventionsTraceabilityService;
//# sourceMappingURL=traceability.service.js.map