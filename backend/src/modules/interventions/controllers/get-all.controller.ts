import { Request, Response, NextFunction } from 'express';
import { InterventionsRepository } from '../repositories/interventions.repository';
import { applyTerritorialFilter } from '../../../shared/middlewares/territorialFilter.middleware';

export class GetAllInterventionsController {
    constructor(private readonly repo: InterventionsRepository) {}
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const filters: any = user ? applyTerritorialFilter(user) : {};
            
            const roles = user?.roles || [];
            if (roles.includes('sgds_manager') || roles.includes('agent_sgds')) {
                filters.assignedService = 'sgds';
            } else if (roles.includes('dst_manager') || roles.includes('agent_dst')) {
                filters.assignedService = 'dst';
            }

            // Pour un agent de terrain ou technicien, on pourrait filtrer par son équipe
            const isFieldAgent = roles.includes('technician') || roles.includes('field_agent');
            const isAdmin = roles.includes('super_admin') || roles.includes('platform_admin');
            
            // TODO: si on veut le restreindre à son équipe, on devrait chercher le team_id de l'utilisateur ici.
            // Actuellement, le requirement de base est de restreindre par zone (déjà géré par applyTerritorialFilter).

            res.json({ success: true, data: await this.repo.getAll(50, filters) }); 
        } catch (e) { 
            next(e); 
        }
    };
}