"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrganizationService = void 0;
class CreateOrganizationService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(data) {
        return this.repository.create(data);
    }
}
exports.CreateOrganizationService = CreateOrganizationService;
//# sourceMappingURL=create.service.js.map