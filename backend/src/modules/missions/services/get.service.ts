import { MissionsRepository } from '../repositories/missions.repository';
import { Mission, PaginatedResponse } from '../types/missions.types';
import { applyTerritorialFilter } from '../../../shared/middlewares/territorialFilter.middleware';
import type { TokenPayload } from '../../auth/types/auth.types';

const FIELD_ROLES = ['technician', 'team_leader', 'field_agent'];
const ADMIN_ROLES = ['super_admin', 'platform_admin'];

export class GetMissionsService {
    constructor(private readonly repository: MissionsRepository) {}

    /**
     * Récupère les missions avec pagination et filtrage territorial.
     * @param userId - ID de l'utilisateur connecté
     * @param roles - Rôles de l'utilisateur
     * @param user - Payload complet pour le filtrage territorial
     * @param page - Page demandée (défaut: 1)
     * @param limit - Nombre d'éléments par page (défaut: 20)
     */
    async execute(
        userId: string,
        roles: string[],
        user?: TokenPayload,
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<Mission>> {
        let teamId: string | undefined = undefined;

        const isFieldAgent = roles.some(r => FIELD_ROLES.includes(r));
        const isAdmin = roles.some(r => ADMIN_ROLES.includes(r));

        if (isFieldAgent && !isAdmin) {
            const userTeamId = await this.repository.getUserTeamId(userId);
            if (userTeamId) {
                teamId = userTeamId;
            } else {
                return { data: [], total: 0, page, limit, totalPages: 0 };
            }
        }

        // 🔐 Filtrage territorial
        const territorialFilters = user ? applyTerritorialFilter(user) : {};

        return this.repository.getMissionsPaginated(teamId, territorialFilters, page, limit);
    }
}
