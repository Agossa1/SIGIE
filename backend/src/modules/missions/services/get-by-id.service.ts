import { MissionsRepository } from '../repositories/missions.repository';
import { MissionDetails } from '../types/missions.types';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class GetMissionByIdService {
    constructor(private readonly repository: MissionsRepository) {}

    async execute(id: string): Promise<MissionDetails> {
        const mission = await this.repository.getMissionById(id);
        if (!mission) {
            throw new NotFoundError('Mission introuvable');
        }
        return mission;
    }
}
