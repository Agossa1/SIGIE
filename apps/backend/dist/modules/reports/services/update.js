"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReportService = void 0;
const appErrors_1 = require("../../../../src/shared/errors/appErrors");
class UpdateReportService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async execute(id, dto, _userId) {
        const existing = await this.repository.getReportById(id);
        if (!existing)
            throw new appErrors_1.NotFoundError('Signalement non trouvé');
        const updated = await this.repository.updateReport(id, dto);
        if (!updated)
            throw new appErrors_1.BadRequestError('Échec de la mise à jour du signalement');
        this.logger.info('Report updated', { reportId: id });
        return updated;
    }
}
exports.UpdateReportService = UpdateReportService;
//# sourceMappingURL=update.js.map