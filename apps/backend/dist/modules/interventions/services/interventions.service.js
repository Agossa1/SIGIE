"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionsService = void 0;
const interventions_enums_1 = require("../types/interventions.enums");
const appErrors_1 = require("../../../shared/errors/appErrors");
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
class InterventionsService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Crée une nouvelle intervention.
     *
     * @throws {BadRequestError} si missionId, interventionType manquants ou type invalide
     */
    async create(input) {
        const { missionId, interventionType, userId } = input;
        if (!missionId || typeof missionId !== 'string' || missionId.trim() === '') {
            throw new appErrors_1.BadRequestError('Le champ "missionId" est obligatoire.');
        }
        if (!interventionType || typeof interventionType !== 'string') {
            throw new appErrors_1.BadRequestError('Le champ "interventionType" est obligatoire.');
        }
        if (!interventions_enums_1.VALID_TYPES.has(interventionType)) {
            throw new appErrors_1.BadRequestError(`Type d'intervention invalide : "${interventionType}". ` +
                `Valeurs acceptées : ${Object.values(interventions_enums_1.InterventionType).join(', ')}.`);
        }
        return this.repository.create(missionId.trim(), interventionType, userId);
    }
    /**
     * Met à jour le statut d'une intervention.
     *
     * @throws {BadRequestError} si le statut est absent ou non reconnu
     * @throws {NotFoundError} si l'intervention n'existe pas
     */
    async updateStatus(input) {
        const { id, status } = input;
        if (!status || typeof status !== 'string') {
            throw new appErrors_1.BadRequestError('Le champ "status" est obligatoire.');
        }
        if (!interventions_enums_1.VALID_STATUSES.has(status)) {
            throw new appErrors_1.BadRequestError(`Statut invalide : "${status}". ` +
                `Valeurs acceptées : ${Object.values(interventions_enums_1.InterventionStatus).join(', ')}.`);
        }
        const updated = await this.repository.updateStatus(id, status);
        if (!updated) {
            throw new appErrors_1.NotFoundError(`Intervention introuvable (id: ${id}).`);
        }
        return updated;
    }
}
exports.InterventionsService = InterventionsService;
//# sourceMappingURL=interventions.service.js.map