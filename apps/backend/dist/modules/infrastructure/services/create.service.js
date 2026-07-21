"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInfrastructureService = void 0;
class CreateInfrastructureService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(data) {
        return this.repository.create(data);
    }
}
exports.CreateInfrastructureService = CreateInfrastructureService;
//# sourceMappingURL=create.service.js.map