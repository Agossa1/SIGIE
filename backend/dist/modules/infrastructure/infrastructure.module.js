"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureInfrastructureRoutes = configureInfrastructureRoutes;
const infrastructure_repository_1 = require("./repositories/infrastructure.repository");
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
const infrastructure_routes_1 = require("./routes/infrastructure.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module Infrastructure — Gestion des ouvrages physiques.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureInfrastructureRoutes(db) {
    const repository = new infrastructure_repository_1.InfrastructureRepository(db, logger_1.logger);
    // Services
    const getAllService = new get_all_service_1.GetAllInfrastructureService(repository);
    const getByIdService = new get_by_id_service_1.GetInfrastructureByIdService(repository);
    const createService = new create_service_1.CreateInfrastructureService(repository);
    const updateService = new update_service_1.UpdateInfrastructureService(repository);
    const deleteService = new delete_service_1.DeleteInfrastructureService(repository);
    // Controllers
    const getAllCtrl = new get_all_controller_1.GetAllInfrastructureController(getAllService);
    const getByIdCtrl = new get_by_id_controller_1.GetInfrastructureByIdController(getByIdService);
    const createCtrl = new create_controller_1.CreateInfrastructureController(createService);
    const updateCtrl = new update_controller_1.UpdateInfrastructureController(updateService);
    const deleteCtrl = new delete_controller_1.DeleteInfrastructureController(deleteService);
    // Routes
    return (0, infrastructure_routes_1.configureInfrastructureRouter)(getAllCtrl, getByIdCtrl, createCtrl, updateCtrl, deleteCtrl);
}
//# sourceMappingURL=infrastructure.module.js.map