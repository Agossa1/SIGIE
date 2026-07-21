"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesModule = void 0;
const roles_repository_1 = require("./repositories/roles.repository");
const roles_service_1 = require("./services/roles.service");
const roles_controller_1 = require("./controllers/roles.controller");
class RolesModule {
    constructor(db, logger) {
        this.rolesRepository = new roles_repository_1.RolesRepository(db);
        this.rolesService = new roles_service_1.RolesService(this.rolesRepository, logger);
        this.rolesController = new roles_controller_1.RolesController(this.rolesService);
    }
}
exports.RolesModule = RolesModule;
//# sourceMappingURL=roles.module.js.map