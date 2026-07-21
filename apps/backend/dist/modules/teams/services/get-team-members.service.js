"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamMembersService = void 0;
class GetTeamMembersService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(teamId) {
        return this.repository.getTeamMembers(teamId);
    }
}
exports.GetTeamMembersService = GetTeamMembersService;
//# sourceMappingURL=get-team-members.service.js.map