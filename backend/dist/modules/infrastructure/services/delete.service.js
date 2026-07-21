"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteInfrastructureService = void 0;
class DeleteInfrastructureService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        return this.repository.softDelete(id);
    }
}
exports.DeleteInfrastructureService = DeleteInfrastructureService;
//# sourceMappingURL=delete.service.js.map