import { Request, Response, NextFunction } from 'express';
import { GetTerritoryService } from '../services/get.service';
import { UpdateTerritoryService } from '../services/update.service';
import { DeleteTerritoryService } from '../services/delete.service';
import { NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class TerritoryController {
    constructor(
        private readonly territoryService: GetTerritoryService,
        private readonly updateTerritoryService: UpdateTerritoryService,
        private readonly deleteTerritoryService: DeleteTerritoryService
    ) { }

    public getRegions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const regions = await this.territoryService.getRegions();
            res.status(200).json(regions);
        } catch (error) {
            next(error);
        }
    };

    public updateMunicipality = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const dto = req.body; // Validation Zod à ajouter ici
            await this.updateTerritoryService.updateMunicipality(id as string, dto);
            res.status(200).json({ message: 'Municipalité mise à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    };

    public deleteMunicipality = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await this.deleteTerritoryService.execute(id as string);
            res.status(204).send(); // No Content
        } catch (error) {
            next(error);
        }
    };

    // Ajoutez des méthodes pour les autres opérations (getMunicipalities, getDistricts, etc.)
}