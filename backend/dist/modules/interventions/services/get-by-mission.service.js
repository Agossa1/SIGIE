"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionsByMissionService = void 0;
class GetInterventionsByMissionService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(missionId) {
        return this.repository.getInterventionsByMission(missionId);
    }
}
exports.GetInterventionsByMissionService = GetInterventionsByMissionService;
//# sourceMappingURL=get-by-mission.service.js.map