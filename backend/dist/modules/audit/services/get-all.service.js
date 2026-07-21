"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllAuditLogsService = void 0;
class GetAllAuditLogsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(filters, page, limit) {
        return this.repository.getAll(filters, page, limit);
    }
}
exports.GetAllAuditLogsService = GetAllAuditLogsService;
//# sourceMappingURL=get-all.service.js.map