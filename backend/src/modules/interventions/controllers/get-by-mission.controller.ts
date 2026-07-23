import { Request, Response, NextFunction } from 'express';
import { InterventionsRepository } from '../repositories/interventions.repository';
import { BadRequestError } from '../../../shared/errors/appErrors';
import { applyTerritorialFilter } from '../../../shared/middlewares/territorialFilter.middleware';

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

            const user = (req as any).user;
            const filters: any = user ? applyTerritorialFilter(user) : {};
            
            const roles = user?.roles || [];
            if (roles.includes('sgds_manager') || roles.includes('agent_sgds')) {
                filters.assignedService = 'sgds';
            } else if (roles.includes('dst_manager') || roles.includes('agent_dst')) {
                filters.assignedService = 'dst';
            }

            const interventions = await this.repo.getByMissionId(missionId, filters);

            res.json({ success: true, data: interventions });
        } catch (err) {
            next(err);
        }
    };
}