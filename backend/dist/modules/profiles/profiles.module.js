"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureProfilesRoutes = configureProfilesRoutes;
const profiles_repository_1 = require("./repositories/profiles.repository");
const get_profile_service_1 = require("./services/get-profile.service");
const update_profile_service_1 = require("./services/update-profile.service");
const get_profile_controller_1 = require("./controllers/get-profile.controller");
const update_profile_controller_1 = require("./controllers/update-profile.controller");
const profiles_routes_1 = require("./routes/profiles.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module Profiles — Gestion des préférences utilisateur.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureProfilesRoutes(db) {
    const repository = new profiles_repository_1.ProfilesRepository(db, logger_1.logger);
    // Services
    const getProfileService = new get_profile_service_1.GetProfileService(repository);
    const updateProfileService = new update_profile_service_1.UpdateProfileService(repository);
    // Controllers
    const getProfileCtrl = new get_profile_controller_1.GetProfileController(getProfileService);
    const updateProfileCtrl = new update_profile_controller_1.UpdateProfileController(updateProfileService);
    // Routes
    return (0, profiles_routes_1.configureProfilesRouter)(getProfileCtrl, updateProfileCtrl);
}
//# sourceMappingURL=profiles.module.js.map