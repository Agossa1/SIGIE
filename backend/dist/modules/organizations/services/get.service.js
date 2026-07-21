"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrganizationsService = void 0;
class GetOrganizationsService {
    constructor(repository) {
        this.repository = repository;
    }
    async executeAll() {
        return this.repository.findAll();
    }
    async executeById(id) {
        return this.repository.findById(id);
    }
}
exports.GetOrganizationsService = GetOrganizationsService;
//# sourceMappingURL=get.service.js.map