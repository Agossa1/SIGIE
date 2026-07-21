"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrganizationTeamsService = void 0;
class GetOrganizationTeamsService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    /**
     * Récupère toutes les équipes actives d'une organisation
     */
    async execute(orgId) {
        this.logger.info(`Récupération des brigades pour l'organisation : ${orgId}`);
        return await this.teamRepository.findByOrganization(orgId);
    }
}
exports.GetOrganizationTeamsService = GetOrganizationTeamsService;
//# sourceMappingURL=get-organization-teams.service.js.map