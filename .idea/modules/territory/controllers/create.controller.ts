import { Request, Response } from 'express';
import { CreateTerritoryService } from '../services/create.service';
import { createMunicipalitySchema } from '../validations/create.validations';
import { AppError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class CreateTerritoryController {
    constructor(private readonly service: CreateTerritoryService) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            // Validation du payload
            const data = createMunicipalitySchema.parse(req.body);

            // On s'assure que l'organizationId provient du token si possible, ou on l'exige dans le body
            const organizationId = (req as any).user?.organizationId || data.organizationId;
            if (!organizationId) {
                res.status(403).json({ error: 'Organisation non identifiée' });
                return;
            }

            const dto = { ...data, organizationId };

            const result = await this.service.execute(dto);
            res.status(201).json({
                message: 'Hiérarchie territoriale créée avec succès',
                data: result
            });
        } catch (error: any) {
            if (error.name === 'ZodError') {
                res.status(400).json({ error: 'Validation échouée', details: error.errors });
                return;
            }
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur CreateTerritoryController:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }
}
