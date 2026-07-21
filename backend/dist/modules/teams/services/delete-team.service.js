"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTeamService = void 0;
class DeleteTeamService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    async execute(id) {
        this.logger.warn(`Désactivation de la brigade : ${id}`);
        await this.teamRepository.deleteTeam(id);
    }
}
exports.DeleteTeamService = DeleteTeamService;
//# sourceMappingURL=delete-team.service.js.map