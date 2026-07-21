import { InterventionsRepository } from '../repositories/interventions.repository';
import { FieldAssignmentStatus } from '../types/interventions.types';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class UpdateInterventionStatusService {
    constructor(private readonly repository: InterventionsRepository) {}

    async execute(id: string, status: FieldAssignmentStatus): Promise<void> {
        // Optionnel : On pourrait vérifier l'existence de l'intervention ici 
        // mais le repository lancera une erreur si nécessaire.
        // Pour être plus propre avec NotFoundError, il faudrait une méthode getInterventionById dans le repo.
        return this.repository.updateInterventionStatus(id, status);
    }
}
