import { Request, Response, NextFunction } from 'express';
import { InterventionsRepository } from '../repositories/interventions.repository';
import { BadRequestError } from '../../../shared/errors/appErrors';

/** Regex simple pour valider un UUID v4. */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GetInterventionsByMissionController
 *
 * Valide le format du missionId avant d'interroger la base.
 * Retourne la liste des interventions au format normalisé.
 */
export class GetInterventionsByMissionController {
    constructor(private readonly repo: InterventionsRepository) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const missionId = String(req.params.missionId || '');

            if (!UUID_REGEX.test(missionId)) {
                throw new BadRequestError(`Le paramètre "missionId" doit être un UUID valide (reçu : "${missionId}").`);
            }

            const interventions = await this.repo.getByMissionId(missionId);

            res.json({ success: true, data: interventions });
        } catch (err) {
            next(err);
        }
    };
}