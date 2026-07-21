"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddInterventionReportService = void 0;
class AddInterventionReportService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(interventionId, createdBy, dto) {
        return this.repository.addInterventionReport(interventionId, createdBy, dto);
    }
}
exports.AddInterventionReportService = AddInterventionReportService;
//# sourceMappingURL=report.service.js.map