"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrganizationService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateOrganizationService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, data) {
        const org = await this.repository.update(id, data);
        if (!org)
            throw new appErrors_1.NotFoundError('Organisation introuvable');
        return org;
    }
}
exports.UpdateOrganizationService = UpdateOrganizationService;
//# sourceMappingURL=update.service.js.map