import { type InterventionRecord } from  '../types/interventions.types'
import { InterventionStatus, InterventionType, VALID_STATUSES, VALID_TYPES } from '../types/interventions.enums';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { InterventionsRepository } from '../repositories/interventions.repository';


export interface CreateInterventionInput {
    missionId: string;
    interventionType: string;
    userId: string;
}

export interface UpdateStatusInput {
    id: string;
    status: string;
}

/**
 * InterventionsService — couche métier centrale.
 *
 * Responsabilités :
 *   - Valider les données avant toute écriture en base
 *   - Appliquer les règles métier (ex: champs obligatoires, valeurs valides)
 *   - Déléguer les opérations de données au repository
 *   - Lancer des AppError typées pour que le middleware d'erreurs renvoie
 *     le bon code HTTP sans try/catch dans les controllers
 */
export class InterventionsService {
    constructor(private readonly repository: InterventionsRepository) {}

    /**
     * Crée une nouvelle intervention.
     *
     * @throws {BadRequestError} si missionId, interventionType manquants ou type invalide
     */
    async create(input: CreateInterventionInput): Promise<InterventionRecord> {
        const { missionId, interventionType, userId } = input;

        if (!missionId || typeof missionId !== 'string' || missionId.trim() === '') {
            throw new BadRequestError('Le champ "missionId" est obligatoire.');
        }

        if (!interventionType || typeof interventionType !== 'string') {
            throw new BadRequestError('Le champ "interventionType" est obligatoire.');
        }

        if (!VALID_TYPES.has(interventionType)) {
            throw new BadRequestError(
                `Type d'intervention invalide : "${interventionType}". ` +
                `Valeurs acceptées : ${Object.values(InterventionType).join(', ')}.`
            );
        }

        return this.repository.create(missionId.trim(), interventionType, userId);
    }

    /**
     * Met à jour le statut d'une intervention.
     *
     * @throws {BadRequestError} si le statut est absent ou non reconnu
     * @throws {NotFoundError} si l'intervention n'existe pas
     */
    async updateStatus(input: UpdateStatusInput): Promise<InterventionRecord> {
        const { id, status } = input;

        if (!status || typeof status !== 'string') {
            throw new BadRequestError('Le champ "status" est obligatoire.');
        }

        if (!VALID_STATUSES.has(status)) {
            throw new BadRequestError(
                `Statut invalide : "${status}". ` +
                `Valeurs acceptées : ${Object.values(InterventionStatus).join(', ')}.`
            );
        }

        const updated = await this.repository.updateStatus(id, status);

        if (!updated) {
            throw new NotFoundError(`Intervention introuvable (id: ${id}).`);
        }

        return updated;
    }
}
