"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllTeamsService = void 0;
class GetAllTeamsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute() {
        return this.repository.getAllTeams();
    }
}
exports.GetAllTeamsService = GetAllTeamsService;
//# sourceMappingURL=get-all-teams.service.js.map