import { MissionsRepository } from '../repositories/missions.repository';
import { CreateMissionReportDTO } from '../types/missions.types';
import { NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class AddMissionReportService {
    constructor(private readonly repository: MissionsRepository) {}

    async execute(missionId: string, userId: string, dto: CreateMissionReportDTO): Promise<void> {
        const mission = await this.repository.getMissionById(missionId);
        if (!mission) {
            throw new NotFoundError('Mission introuvable');
        }

        await this.repository.createMissionReport(missionId, userId, dto);
    }
}
