"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionsService = void 0;
const territorialFilter_middleware_1 = require("../../../shared/middlewares/territorialFilter.middleware");
const FIELD_ROLES = ['technician', 'team_leader', 'supervisor', 'field_agent'];
const ADMIN_ROLES = ['super_admin', 'platform_admin'];
class GetMissionsService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Récupère les missions avec pagination et filtrage territorial.
     * @param userId - ID de l'utilisateur connecté
     * @param roles - Rôles de l'utilisateur
     * @param user - Payload complet pour le filtrage territorial
     * @param page - Page demandée (défaut: 1)
     * @param limit - Nombre d'éléments par page (défaut: 20)
     */
    async execute(userId, roles, user, page = 1, limit = 20) {
        let teamId = undefined;
        const isFieldAgent = roles.some(r => FIELD_ROLES.includes(r));
        const isAdmin = roles.some(r => ADMIN_ROLES.includes(r));
        if (isFieldAgent && !isAdmin) {
            const userTeamId = await this.repository.getUserTeamId(userId);
            if (userTeamId) {
                teamId = userTeamId;
            }
            else {
                return { data: [], total: 0, page, limit, totalPages: 0 };
            }
        }
        // 🔐 Filtrage territorial
        const territorialFilters = user ? (0, territorialFilter_middleware_1.applyTerritorialFilter)(user) : {};
        return this.repository.getMissionsPaginated(teamId, territorialFilters, page, limit);
    }
}
exports.GetMissionsService = GetMissionsService;
//# sourceMappingURL=get.service.js.map