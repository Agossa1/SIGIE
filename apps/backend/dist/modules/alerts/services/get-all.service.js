"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllAlertsService = void 0;
class GetAllAlertsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(filters) {
        return this.repository.getAll(filters);
    }
}
exports.GetAllAlertsService = GetAllAlertsService;
//# sourceMappingURL=get-all.service.js.map