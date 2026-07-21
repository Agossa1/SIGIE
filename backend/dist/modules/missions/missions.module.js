"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionsModule = void 0;
const winston_1 = require("winston");
const missions_repository_1 = require("./repositories/missions.repository");
const create_service_1 = require("./services/create.service");
const get_service_1 = require("./services/get.service");
const update_service_1 = require("./services/update.service");
const get_by_id_service_1 = require("./services/get-by-id.service");
const assign_service_1 = require("./services/assign.service");
const report_service_1 = require("./services/report.service");
const create_mission_controller_1 = require("./controllers/create-mission.controller");
const get_missions_controller_1 = require("./controllers/get-missions.controller");
const get_mission_by_id_controller_1 = require("./controllers/get-mission-by-id.controller");
const update_mission_controller_1 = require("./controllers/update-mission.controller");
const update_mission_status_controller_1 = require("./controllers/update-mission-status.controller");
const assign_mission_controller_1 = require("./controllers/assign-mission.controller");
const add_mission_report_controller_1 = require("./controllers/add-mission-report.controller");
/**
 * Module Missions — Point d'entrée avec injection de dépendances centralisée.
 * 7 contrôleurs, 6 services, 1 repository.
 * Pattern 1-fichier = 1-classe respecté.
 */
class MissionsModule {
    constructor(db) {
        const logger = (0, winston_1.createLogger)({
            format: winston_1.format.simple(),
            transports: [new winston_1.transports.Console()],
        });
        this.repository = new missions_repository_1.MissionsRepository(db, logger);
        // Services (sans SQL direct — utilisent le repository)
        const createService = new create_service_1.CreateMissionService(this.repository);
        const getService = new get_service_1.GetMissionsService(this.repository);
        const updateService = new update_service_1.UpdateMissionService(this.repository, db);
        const getByIdService = new get_by_id_service_1.GetMissionByIdService(this.repository);
        const assignService = new assign_service_1.AssignMissionService(this.repository);
        const reportService = new report_service_1.AddMissionReportService(this.repository);
        // Contrôleurs (1 classe = 1 fichier)
        this.services = {
            create: { service: createService, controller: new create_mission_controller_1.CreateMissionController(createService) },
            get: { service: getService, controller: new get_missions_controller_1.GetMissionsController(getService) },
            update: { service: updateService, controller: new update_mission_controller_1.UpdateMissionController(updateService) },
            updateStatus: { service: updateService, controller: new update_mission_status_controller_1.UpdateMissionStatusController(updateService) },
            getById: { service: getByIdService, controller: new get_mission_by_id_controller_1.GetMissionByIdController(getByIdService) },
            assign: { service: assignService, controller: new assign_mission_controller_1.AssignMissionController(assignService) },
            report: { service: reportService, controller: new add_mission_report_controller_1.AddMissionReportController(reportService) },
        };
    }
}
exports.MissionsModule = MissionsModule;
//# sourceMappingURL=missions.module.js.map