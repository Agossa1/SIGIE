"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionsByTeamService = void 0;
class GetInterventionsByTeamService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(userId, roles) {
        if (roles.includes('field_agent') && !roles.includes('super_admin') && !roles.includes('platform_admin')) {
            const teamId = await this.repository.getUserTeamId(userId);
            if (!teamId) {
                return [];
            }
            return this.repository.getInterventionsByTeamId(teamId);
        }
        // If the user is an admin but calls this, they shouldn't usually.
        // But if they do, we could return all or nothing. For now, return empty.
        // Admins should fetch by mission ID.
        return [];
    }
}
exports.GetInterventionsByTeamService = GetInterventionsByTeamService;
//# sourceMappingURL=get-by-team.service.js.map