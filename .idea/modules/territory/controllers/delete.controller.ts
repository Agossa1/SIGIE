import { Request, Response } from 'express';
import { DeleteTerritoryService } from '../services/delete.service';
import { AppError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class DeleteTerritoryController {
    constructor(private readonly service: DeleteTerritoryService) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const organizationId = (req as any).user?.organizationId;

            if (!id) {
                res.status(400).json({ error: 'ID de la municipalité requis' });
                return;
            }

            if (!organizationId) {
                res.status(403).json({ error: 'Organisation non identifiée' });
                return;
            }

            await this.service.execute(id as string, organizationId);
            res.status(200).json({ message: 'Municipalité supprimée avec succès' });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur DeleteTerritoryController:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }
}
