"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetMissionByIdService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        const mission = await this.repository.getMissionById(id);
        if (!mission) {
            throw new appErrors_1.NotFoundError('Mission introuvable');
        }
        return mission;
    }
}
exports.GetMissionByIdService = GetMissionByIdService;
//# sourceMappingURL=get-by-id.service.js.map