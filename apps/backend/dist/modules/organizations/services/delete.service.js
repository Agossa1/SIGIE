"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteOrganizationService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteOrganizationService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        const deleted = await this.repository.softDelete(id);
        if (!deleted)
            throw new appErrors_1.NotFoundError('Organisation introuvable');
        return deleted;
    }
}
exports.DeleteOrganizationService = DeleteOrganizationService;
//# sourceMappingURL=delete.service.js.map