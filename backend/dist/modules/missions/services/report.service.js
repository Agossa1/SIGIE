"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMissionReportService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class AddMissionReportService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(missionId, userId, dto) {
        const mission = await this.repository.getMissionById(missionId);
        if (!mission) {
            throw new appErrors_1.NotFoundError('Mission introuvable');
        }
        await this.repository.createMissionReport(missionId, userId, dto);
    }
}
exports.AddMissionReportService = AddMissionReportService;
//# sourceMappingURL=report.service.js.map