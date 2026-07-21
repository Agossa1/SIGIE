import { Team, TeamDTO } from '../types/teams.types';

export class TeamMapper {
    public static toDTO(team: Team): TeamDTO {
        return {
            id: team.id,
            name: team.name,
            organizationId: team.organization_id,
            municipalityId: team.municipality_id,
            teamType: team.team_type,
            description: team.description,
            status: team.status,
            createdAt: team.created_at?.toISOString() || new Date().toISOString(),
            updatedAt: team.updated_at?.toISOString(),
            membersCount: team.members_count
        };
    }
}
