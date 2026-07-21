"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrganizationByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetOrganizationByIdService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        const org = await this.repository.getById(id);
        if (!org)
            throw new appErrors_1.NotFoundError('Organisation introuvable');
        return org;
    }
}
exports.GetOrganizationByIdService = GetOrganizationByIdService;
//# sourceMappingURL=get-by-id.service.js.map