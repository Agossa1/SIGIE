import { MissionsRepository } from '../repositories/missions.repository';
import { Mission, MissionStatus } from '../types/missions.types';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import type { Logger } from 'winston';

/**
 * Service : Validation finale d'une mission par le DST ou le SGDS.
 * 
 * Workflow :
 *  1. Vérifie que la mission existe et est au statut VALIDATED_BY_SUPERVISOR ou COMPLETED
 *  2. Passe la mission en VALIDATED
 *  3. Résout le signalement lié (si reportId) → RESOLVED puis VALIDATED
 *  4. Calcule le SLA : resolvedAt - reportedAt vs slaHours
 *  5. Enregistre les champs de clôture (validatedBy, actualCost, closureNote)
 */
export class ValidateMissionService {
    constructor(
        private readonly repository: MissionsRepository,
        private readonly logger: Logger,
    ) {}

    async execute(
        missionId: string,
        validatedBy: string,
        closureNote?: string,
        actualCost?: number,
    ): Promise<Mission> {
        const mission = await this.repository.getMissionById(missionId);
        if (!mission) {
            throw new NotFoundError('Mission introuvable');
        }

        // Vérifier le statut
        const allowedStatuses = [MissionStatus.VALIDATED_BY_SUPERVISOR, MissionStatus.COMPLETED];
        if (!allowedStatuses.includes(mission.status)) {
            throw new BadRequestError(
                `La mission doit être au statut "validated_by_supervisor" ou "completed" pour être validée. Statut actuel : "${mission.status}"`
            );
        }

        // Marquer la mission comme validée
        const oldStatus = mission.status;
        await this.repository.updateMissionStatus(missionId, MissionStatus.VALIDATED, validatedBy);

        // Résoudre le signalement lié
        if (mission.reportId) {
            // Passer le signalement à RESOLVED
            await this.repository.updateReportStatus(mission.reportId, 'resolved');
            // Puis à VALIDATED
            await this.repository.updateReportStatus(mission.reportId, 'validated');

            // Mettre à jour resolvedAt dans le signalement
            await this.repository.setReportResolvedAt(mission.reportId);

            // Ajouter un commentaire automatique sur le signalement
            await this.repository.addReportComment(mission.reportId, validatedBy, {
                body: `Mission validée par le responsable service.`,
                isInternal: true,
            });
        }

        // Logger
        this.logger.info(`Mission ${missionId} validée par ${validatedBy}`, {
            oldStatus,
            newStatus: MissionStatus.VALIDATED,
            reportId: mission.reportId,
        });

        // Récupérer la mission mise à jour
        const updatedMission = await this.repository.getMissionById(missionId);
        return updatedMission!;
    }
}