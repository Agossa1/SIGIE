import { InterventionsRepository } from '../repositories/interventions.repository';
import { Intervention } from '../types/interventions.types';

export class GetInterventionsByMissionService {
    constructor(private readonly repository: InterventionsRepository) {}

    async execute(missionId: string): Promise<Intervention[]> {
        return this.repository.getInterventionsByMission(missionId);
    }
}
