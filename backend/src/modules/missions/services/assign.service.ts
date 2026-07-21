import { MissionsRepository } from '../repositories/missions.repository';
import { AssignMissionDTO } from '../types/missions.types';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class AssignMissionService {
    constructor(private readonly repository: MissionsRepository) {}

    async execute(missionId: string, dto: AssignMissionDTO): Promise<void> {
        const mission = await this.repository.getMissionById(missionId);
        if (!mission) {
            throw new NotFoundError('Mission introuvable');
        }
        
        await this.repository.assignUsersToMission(missionId, dto.userIds);
    }
}
