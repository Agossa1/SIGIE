"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInfrastructureByIdService = void 0;
class GetInfrastructureByIdService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        return this.repository.getById(id);
    }
}
exports.GetInfrastructureByIdService = GetInfrastructureByIdService;
//# sourceMappingURL=get-by-id.service.js.map