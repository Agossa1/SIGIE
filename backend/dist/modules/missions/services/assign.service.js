"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignMissionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class AssignMissionService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(missionId, dto) {
        const mission = await this.repository.getMissionById(missionId);
        if (!mission) {
            throw new appErrors_1.NotFoundError('Mission introuvable');
        }
        await this.repository.assignUsersToMission(missionId, dto.userIds);
    }
}
exports.AssignMissionService = AssignMissionService;
//# sourceMappingURL=assign.service.js.map