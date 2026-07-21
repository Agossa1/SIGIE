"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureOrganizationsRoutes = configureOrganizationsRoutes;
const organizations_repository_1 = require("./repositories/organizations.repository");
const get_all_service_1 = require("./services/get-all.service");
const get_by_id_service_1 = require("./services/get-by-id.service");
const create_service_1 = require("./services/create.service");
const update_service_1 = require("./services/update.service");
const delete_service_1 = require("./services/delete.service");
const get_all_controller_1 = require("./controllers/get-all.controller");
const get_by_id_controller_1 = require("./controllers/get-by-id.controller");
const create_controller_1 = require("./controllers/create.controller");
const update_controller_1 = require("./controllers/update.controller");
const delete_controller_1 = require("./controllers/delete.controller");
const organizations_routes_1 = require("./routes/organizations.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module Organizations — Gestion des entités de rattachement.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureOrganizationsRoutes(db) {
    const repository = new organizations_repository_1.OrganizationsRepository(db, logger_1.logger);
    // Services
    const getAllService = new get_all_service_1.GetAllOrganizationsService(repository);
    const getByIdService = new get_by_id_service_1.GetOrganizationByIdService(repository);
    const createService = new create_service_1.CreateOrganizationService(repository);
    const updateService = new update_service_1.UpdateOrganizationService(repository);
    const deleteService = new delete_service_1.DeleteOrganizationService(repository);
    // Controllers
    const getAllCtrl = new get_all_controller_1.GetAllOrganizationsController(getAllService);
    const getByIdCtrl = new get_by_id_controller_1.GetOrganizationByIdController(getByIdService);
    const createCtrl = new create_controller_1.CreateOrganizationController(createService);
    const updateCtrl = new update_controller_1.UpdateOrganizationController(updateService);
    const deleteCtrl = new delete_controller_1.DeleteOrganizationController(deleteService);
    // Routes
    return (0, organizations_routes_1.configureOrganizationsRouter)(getAllCtrl, getByIdCtrl, createCtrl, updateCtrl, deleteCtrl);
}
//# sourceMappingURL=organizations.module.js.map