"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllOrganizationsService = void 0;
class GetAllOrganizationsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute() { return this.repository.getAll(); }
}
exports.GetAllOrganizationsService = GetAllOrganizationsService;
//# sourceMappingURL=get-all.service.js.map