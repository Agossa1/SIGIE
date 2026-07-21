"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGisRoutes = configureGisRoutes;
const gis_repository_1 = require("./repositories/gis.repository");
const get_all_service_1 = require("./services/get-all.service");
const get_by_id_service_1 = require("./services/get-by-id.service");
const create_service_1 = require("./services/create.service");
const delete_service_1 = require("./services/delete.service");
const get_all_controller_1 = require("./controllers/get-all.controller");
const get_by_id_controller_1 = require("./controllers/get-by-id.controller");
const create_controller_1 = require("./controllers/create.controller");
const delete_controller_1 = require("./controllers/delete.controller");
const gis_routes_1 = require("./routes/gis.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module GIS — Gestion des couches géographiques.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureGisRoutes(db) {
    const repository = new gis_repository_1.GisRepository(db, logger_1.logger);
    // Services
    const getAllService = new get_all_service_1.GetAllGisLayersService(repository);
    const getByIdService = new get_by_id_service_1.GetGisLayerByIdService(repository);
    const createService = new create_service_1.CreateGisLayerService(repository);
    const deleteService = new delete_service_1.DeleteGisLayerService(repository);
    // Controllers
    const getAllCtrl = new get_all_controller_1.GetAllGisLayersController(getAllService);
    const getByIdCtrl = new get_by_id_controller_1.GetGisLayerByIdController(getByIdService);
    const createCtrl = new create_controller_1.CreateGisLayerController(createService);
    const deleteCtrl = new delete_controller_1.DeleteGisLayerController(deleteService);
    // Routes
    return (0, gis_routes_1.configureGisRouter)(getAllCtrl, getByIdCtrl, createCtrl, deleteCtrl);
}
//# sourceMappingURL=gis.module.js.map