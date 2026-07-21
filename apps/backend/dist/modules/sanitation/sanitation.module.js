"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSanitationRoutes = configureSanitationRoutes;
const sanitation_repository_1 = require("./repositories/sanitation.repository");
const get_waste_points_service_1 = require("./services/get-waste-points.service");
const create_waste_point_service_1 = require("./services/create-waste-point.service");
const get_collections_service_1 = require("./services/get-collections.service");
const create_collection_service_1 = require("./services/create-collection.service");
const get_campaigns_service_1 = require("./services/get-campaigns.service");
const get_waste_points_controller_1 = require("./controllers/get-waste-points.controller");
const create_waste_point_controller_1 = require("./controllers/create-waste-point.controller");
const get_collections_controller_1 = require("./controllers/get-collections.controller");
const create_collection_controller_1 = require("./controllers/create-collection.controller");
const get_campaigns_controller_1 = require("./controllers/get-campaigns.controller");
const sanitation_routes_1 = require("./routes/sanitation.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module Sanitation — Gestion de la salubrité, collectes, points de déchets, campagnes.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureSanitationRoutes(db) {
    const repository = new sanitation_repository_1.SanitationRepository(db, logger_1.logger);
    // Services
    const getWastePointsService = new get_waste_points_service_1.GetWastePointsService(repository);
    const createWastePointService = new create_waste_point_service_1.CreateWastePointService(repository);
    const getCollectionsService = new get_collections_service_1.GetCollectionsService(repository);
    const createCollectionService = new create_collection_service_1.CreateCollectionService(repository);
    const getCampaignsService = new get_campaigns_service_1.GetCampaignsService(repository);
    // Controllers
    const getWastePointsCtrl = new get_waste_points_controller_1.GetWastePointsController(getWastePointsService);
    const createWastePointCtrl = new create_waste_point_controller_1.CreateWastePointController(createWastePointService);
    const getCollectionsCtrl = new get_collections_controller_1.GetCollectionsController(getCollectionsService);
    const createCollectionCtrl = new create_collection_controller_1.CreateCollectionController(createCollectionService);
    const getCampaignsCtrl = new get_campaigns_controller_1.GetCampaignsController(getCampaignsService);
    // Routes
    return (0, sanitation_routes_1.configureSanitationRouter)(getWastePointsCtrl, createWastePointCtrl, getCollectionsCtrl, createCollectionCtrl, getCampaignsCtrl);
}
//# sourceMappingURL=sanitation.module.js.map