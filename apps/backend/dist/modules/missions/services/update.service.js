"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMissionService = void 0;
const missions_types_1 = require("../types/missions.types");
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateMissionService {
    constructor(repository, db) {
        this.repository = repository;
        this.db = db;
    }
    async executeUpdate(id, dto) {
        const mission = await this.repository.getMissionById(id);
        if (!mission)
            throw new appErrors_1.NotFoundError('Mission introuvable');
        await this.repository.updateMission(id, dto);
    }
    async executeStatus(id, status, changedBy, forceCompleteInterventions) {
        const mission = await this.repository.getMissionById(id);
        if (!mission)
            throw new appErrors_1.NotFoundError('Mission introuvable');
        if (status === missions_types_1.MissionStatus.COMPLETED || status === missions_types_1.MissionStatus.VALIDATED) {
            const hasActive = await this.repository.hasActiveInterventions(id);
            if (hasActive) {
                if (!forceCompleteInterventions) {
                    throw new appErrors_1.ValidationError('Il y a des interventions en cours. Voulez-vous les clôturer automatiquement ?', { hasActiveInterventions: true });
                }
                else {
                    await this.repository.completeAllActiveInterventions(id);
                }
            }
        }
        await this.repository.updateMissionStatus(id, status, changedBy);
        // 🔗 Connexion Reports ↔ Missions :
        // Quand une mission passe à completed/validated, on résout le signalement lié
        if ((status === missions_types_1.MissionStatus.COMPLETED || status === missions_types_1.MissionStatus.VALIDATED) &&
            mission.reportId) {
            this.repository.resolveLinkedReport(mission.reportId).catch(() => {
                // Silencieux — ne pas bloquer le status update
            });
        }
    }
}
exports.UpdateMissionService = UpdateMissionService;
//# sourceMappingURL=update.service.js.map