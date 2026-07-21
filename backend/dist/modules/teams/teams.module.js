"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTeamsRoutes = configureTeamsRoutes;
const teams_repository_1 = require("./repositories/teams.repository");
const get_all_teams_service_1 = require("./services/get-all-teams.service");
const get_team_members_service_1 = require("./services/get-team-members.service");
const get_all_controller_1 = require("./controllers/get-all.controller");
const get_members_controller_1 = require("./controllers/get-members.controller");
const teams_routes_1 = require("./routes/teams.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module Teams — Gestion des équipes et brigades.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureTeamsRoutes(db) {
    const repository = new teams_repository_1.TeamsRepository(db, logger_1.logger);
    // Services
    const getAllService = new get_all_teams_service_1.GetAllTeamsService(repository);
    const getMembersService = new get_team_members_service_1.GetTeamMembersService(repository);
    // Controllers
    const getAllCtrl = new get_all_controller_1.GetAllTeamsController(getAllService);
    const getMembersCtrl = new get_members_controller_1.GetTeamMembersController(getMembersService);
    // Routes
    return (0, teams_routes_1.configureTeamsRouter)(getAllCtrl, getMembersCtrl);
}
//# sourceMappingURL=teams.module.js.map