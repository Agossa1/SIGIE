import { TeamsRepository } from '../repositories/teams.repository';
import type { TeamMember } from '../repositories/teams.repository';

export class GetTeamMembersService {
    constructor(private readonly repository: TeamsRepository) {}
    async execute(teamId: string): Promise<TeamMember[]> {
        return this.repository.getTeamMembers(teamId);
    }
}