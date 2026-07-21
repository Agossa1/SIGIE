"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTeamService = void 0;
class UpdateTeamService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    async execute(id, data) {
        this.logger.info(`Mise à jour de la brigade : ${id}`);
        // On pourrait ajouter ici des vérifications de droits (ex: seul l'admin de l'org peut modifier)
        return await this.teamRepository.updateTeam(id, data);
    }
}
exports.UpdateTeamService = UpdateTeamService;
//# sourceMappingURL=update-team.service.js.map