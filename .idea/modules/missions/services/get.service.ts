import { MissionsRepository } from '../repositories/missions.repository';
import { Mission } from '../types/missions.types';

export class GetMissionsService {
    constructor(private readonly repository: MissionsRepository) {}

    async execute(userId: string, roles: string[]): Promise<Mission[]> {
        let teamId: string | undefined = undefined;

        if (roles.includes('field_agent') && !roles.includes('super_admin') && !roles.includes('platform_admin')) {
            const userTeamId = await this.repository.getUserTeamId(userId);
            if (userTeamId) {
                teamId = userTeamId;
            } else {
                // If the field agent has no team, they shouldn't see any missions. 
                // A quick way is to pass a non-existent team ID or just return empty.
                return [];
            }
        }

        return this.repository.getMissions(teamId);
    }
}
