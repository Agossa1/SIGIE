import { Request, Response } from 'express';
import { RolesService } from '../services/roles.service';

export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    getAllRoles = async (req: Request, res: Response): Promise<void> => {
        try {
            const roles = await this.rolesService.getAllRoles();
            res.status(200).json({ success: true, data: roles });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Erreur lors de la récupération des rôles' });
        }
    };

    updateRole = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            const data = req.body;
            const updatedRole = await this.rolesService.updateRole(id, data);
            
            if (!updatedRole) {
                res.status(404).json({ success: false, message: 'Rôle non trouvé ou aucune modification apportée' });
                return;
            }
            res.status(200).json({ success: true, data: updatedRole });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du rôle' });
        }
    };
}
