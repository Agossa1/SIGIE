import { InterventionsRepository } from '../repositories/interventions.repository';
import { Intervention } from '../types/interventions.types';

export class GetInterventionsByTeamService {
    constructor(private readonly repository: InterventionsRepository) {}

    async execute(userId: string, roles: string[]): Promise<Intervention[]> {
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
