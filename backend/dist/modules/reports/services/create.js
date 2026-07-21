"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReportService = void 0;
class CreateReportService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async execute(dto, userId) {
        this.logger.info('Creating report', { userId, category: dto.issueCategory });
        return this.repository.createReport(dto, userId);
    }
}
exports.CreateReportService = CreateReportService;
//# sourceMappingURL=create.js.map