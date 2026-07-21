"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInfrastructureService = void 0;
class UpdateInfrastructureService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, data) {
        return this.repository.update(id, data);
    }
}
exports.UpdateInfrastructureService = UpdateInfrastructureService;
//# sourceMappingURL=update.service.js.map