"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllInfrastructureService = void 0;
class GetAllInfrastructureService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(filters, page, limit) {
        return this.repository.getAll(filters, page, limit);
    }
}
exports.GetAllInfrastructureService = GetAllInfrastructureService;
//# sourceMappingURL=get-all.service.js.map