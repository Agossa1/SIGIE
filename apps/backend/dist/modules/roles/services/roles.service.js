"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
class RolesService {
    constructor(rolesRepository, logger) {
        this.rolesRepository = rolesRepository;
        this.logger = logger;
    }
    async getAllRoles() {
        this.logger.info('Fetching all roles from DB');
        return await this.rolesRepository.findAll();
    }
    async updateRole(id, data) {
        this.logger.info(`Updating role ${id}`);
        return await this.rolesRepository.update(id, data);
    }
}
exports.RolesService = RolesService;
//# sourceMappingURL=roles.service.js.map