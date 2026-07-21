import { InterventionsRepository } from '../repositories/interventions.repository';
import { CreateInterventionDTO } from '../types/interventions.types';

export class CreateInterventionService {
    constructor(private readonly repository: InterventionsRepository) {}

    async execute(dto: CreateInterventionDTO): Promise<string> {
        return this.repository.createIntervention(dto);
    }
}
