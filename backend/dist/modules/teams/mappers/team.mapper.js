"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMapper = void 0;
class TeamMapper {
    static toDTO(team) {
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
exports.TeamMapper = TeamMapper;
//# sourceMappingURL=team.mapper.js.map