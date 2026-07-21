"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignReportService = void 0;
const appErrors_1 = require("../../../../src/shared/errors/appErrors");
class AssignReportService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async execute(reportId, assignedBy, dto) {
        const report = await this.repository.getReportById(reportId);
        if (!report)
            throw new appErrors_1.NotFoundError('Signalement non trouvé');
        await this.repository.assignReport(reportId, assignedBy, dto);
        return (await this.repository.getReportById(reportId));
    }
}
exports.AssignReportService = AssignReportService;
//# sourceMappingURL=assign.js.map