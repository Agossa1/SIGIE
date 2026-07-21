"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteReportService = void 0;
const appErrors_1 = require("../../../../src/shared/errors/appErrors");
class DeleteReportService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async execute(id, _userId) {
        const deleted = await this.repository.deleteReport(id);
        if (!deleted)
            throw new appErrors_1.NotFoundError('Signalement non trouvé ou déjà supprimé');
        this.logger.info('Report soft-deleted', { reportId: id });
    }
}
exports.DeleteReportService = DeleteReportService;
//# sourceMappingURL=delete.js.map