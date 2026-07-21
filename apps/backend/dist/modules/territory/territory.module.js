"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTerritoryRoutes = configureTerritoryRoutes;
const territory_repository_1 = require("./repositories/territory.repository");
const get_regions_service_1 = require("./services/get-regions.service");
const get_municipalities_service_1 = require("./services/get-municipalities.service");
const get_districts_service_1 = require("./services/get-districts.service");
const get_neighborhoods_service_1 = require("./services/get-neighborhoods.service");
const get_regions_controller_1 = require("./controllers/get-regions.controller");
const get_municipalities_controller_1 = require("./controllers/get-municipalities.controller");
const get_districts_controller_1 = require("./controllers/get-districts.controller");
const get_neighborhoods_controller_1 = require("./controllers/get-neighborhoods.controller");
const territory_routes_1 = require("./routes/territory.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module Territory — Découpage administratif du Bénin.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureTerritoryRoutes(db) {
    const repository = new territory_repository_1.TerritoryRepository(db, logger_1.logger);
    // Services
    const getRegionsService = new get_regions_service_1.GetRegionsService(repository);
    const getMunicipalitiesService = new get_municipalities_service_1.GetMunicipalitiesService(repository);
    const getDistrictsService = new get_districts_service_1.GetDistrictsService(repository);
    const getNeighborhoodsService = new get_neighborhoods_service_1.GetNeighborhoodsService(repository);
    // Controllers
    const getRegionsCtrl = new get_regions_controller_1.GetRegionsController(getRegionsService);
    const getMunicipalitiesCtrl = new get_municipalities_controller_1.GetMunicipalitiesController(getMunicipalitiesService);
    const getDistrictsCtrl = new get_districts_controller_1.GetDistrictsController(getDistrictsService);
    const getNeighborhoodsCtrl = new get_neighborhoods_controller_1.GetNeighborhoodsController(getNeighborhoodsService);
    // Routes
    return (0, territory_routes_1.configureTerritoryRouter)(getRegionsCtrl, getMunicipalitiesCtrl, getDistrictsCtrl, getNeighborhoodsCtrl);
}
//# sourceMappingURL=territory.module.js.map