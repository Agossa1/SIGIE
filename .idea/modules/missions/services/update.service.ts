import { MissionsRepository } from '../repositories/missions.repository';
import { UpdateMissionDTO } from '../types/missions.types';
import { NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class UpdateMissionService {
    constructor(private readonly repository: MissionsRepository) {}

    async executeUpdate(id: string, dto: UpdateMissionDTO): Promise<void> {
        const mission = await this.repository.getMissionById(id);
        if (!mission) {
            throw new NotFoundError('Mission introuvable');
        }
        await this.repository.updateMission(id, dto);
    }

    async executeStatus(id: string, status: string, changedBy: string): Promise<void> {
        const mission = await this.repository.getMissionById(id);
        if (!mission) {
            throw new NotFoundError('Mission introuvable');
        }
        return this.repository.updateMissionStatus(id, status, changedBy);
    }
}
