import { MissionsRepository } from '../repositories/missions.repository';
import { Mission, CreateMissionDTO } from '../types/missions.types';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';

/**
 * Service : Créer une mission directement depuis un signalement.
 * 
 * Workflow :
 *  1. Vérifie que le signalement existe et n'est pas déjà lié à une mission active
 *  2. Pré-remplit les champs de la mission avec les données du signalement
 *  3. Crée la mission avec reportId
 *  4. Met à jour le statut du signalement → ASSIGNED
 */
export class CreateMissionFromReportService {
    constructor(private readonly repository: MissionsRepository) {}

    async execute(dto: CreateMissionDTO): Promise<Mission> {
        if (!dto.reportId) {
            throw new BadRequestError('reportId est obligatoire pour créer une mission depuis un signalement');
        }

        const existingReport = await this.repository.findReportById(dto.reportId);
        if (!existingReport) {
            throw new NotFoundError('Signalement source introuvable');
        }

        const existingMission = await this.repository.findActiveMissionByReportId(dto.reportId);
        if (existingMission) {
            throw new BadRequestError(
                `Ce signalement est déjà lié à la mission "${existingMission.title}" (statut: ${existingMission.status})`
            );
        }

        if (!dto.title && existingReport.title) {
            dto.title = existingReport.title;
        }
        if (!dto.municipalityId && existingReport.municipality_id) {
            dto.municipalityId = existingReport.municipality_id;
        }
        if (!dto.latitude && existingReport.latitude) {
            dto.latitude = existingReport.latitude;
        }
        if (!dto.longitude && existingReport.longitude) {
            dto.longitude = existingReport.longitude;
        }

        // createMission retourne un string (l'ID)
        const missionId = await this.repository.createMission(dto);

        // Logger le statut initial
        await this.repository.insertMissionStatusLog(missionId, null, 'draft', dto.createdBy);

        // Mettre à jour le statut du signalement
        await this.repository.updateReportStatus(dto.reportId, 'assigned');

        // Récupérer la mission complète
        const mission = await this.repository.getMissionById(missionId);
        if (!mission) {
            throw new NotFoundError('Mission créée mais introuvable après création');
        }

        return mission;
    }
}