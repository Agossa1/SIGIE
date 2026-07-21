import { MissionsRepository } from '../repositories/missions.repository';
import { MissionStatus, UpdateMissionDTO } from '../types/missions.types';
import { NotFoundError, ValidationError } from '../../../shared/errors/appErrors';

export class UpdateMissionService {
    constructor(
        private readonly repository: MissionsRepository,
        private readonly db?: any, // plus utilisé — conservé pour rétrocompatibilité du constructeur
    ) {}

    async executeUpdate(id: string, dto: UpdateMissionDTO): Promise<void> {
        const mission = await this.repository.getMissionById(id);
        if (!mission) throw new NotFoundError('Mission introuvable');
        await this.repository.updateMission(id, dto);
    }

    async executeStatus(id: string, status: string, changedBy: string, forceCompleteInterventions?: boolean): Promise<void> {
        const mission = await this.repository.getMissionById(id);
        if (!mission) throw new NotFoundError('Mission introuvable');

        if (status === MissionStatus.COMPLETED || status === MissionStatus.VALIDATED) {
            const hasActive = await this.repository.hasActiveInterventions(id);
            if (hasActive) {
                if (!forceCompleteInterventions) {
                    throw new ValidationError('Il y a des interventions en cours. Voulez-vous les clôturer automatiquement ?', { hasActiveInterventions: true });
                } else {
                    await this.repository.completeAllActiveInterventions(id);
                }
            }
        }

        await this.repository.updateMissionStatus(id, status, changedBy);

        // 🔗 Connexion Reports ↔ Missions :
        // Quand une mission passe à completed/validated, on résout le signalement lié
        if (
            (status === MissionStatus.COMPLETED || status === MissionStatus.VALIDATED) &&
            mission.reportId
        ) {
            this.repository.resolveLinkedReport(mission.reportId).catch(() => {
                // Silencieux — ne pas bloquer le status update
            });
        }
    }
}