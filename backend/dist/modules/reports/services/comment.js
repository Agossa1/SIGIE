"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentReportService = void 0;
const appErrors_1 = require("../../../../src/shared/errors/appErrors");
class CommentReportService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async execute(reportId, authorId, dto) {
        const report = await this.repository.getReportById(reportId);
        if (!report)
            throw new appErrors_1.NotFoundError('Signalement non trouvé');
        return this.repository.addComment(reportId, authorId, dto);
    }
}
exports.CommentReportService = CommentReportService;
//# sourceMappingURL=comment.js.map