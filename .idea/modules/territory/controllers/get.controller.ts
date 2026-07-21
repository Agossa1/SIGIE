import { Request, Response } from 'express';
import { GetTerritoryService } from '../services/get.service';
import { AppError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { TerritoryGeoJsonLevel } from '../types/territory.types';

const GEOJSON_LEVELS: TerritoryGeoJsonLevel[] = ['regions', 'municipalities', 'districts', 'neighborhoods'];

export class GetTerritoryController {
    constructor(private readonly service: GetTerritoryService) {}

    async getHierarchy(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            
            if (!userId) {
                res.status(403).json({ error: 'Utilisateur non identifié' });
                return;
            }

            // organizationId est optionnel : les agents terrain ont uniquement municipalityId
            const organizationId = (req as any).user?.organizationId ?? null;

            const result = await this.service.getHierarchy(organizationId, userId);
            res.status(200).json({ data: result });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur GetTerritoryController.getHierarchy:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }

    async getRegions(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.service.getRegions();
            res.status(200).json({ data: result });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur GetTerritoryController.getRegions:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }

    async getMunicipalities(req: Request, res: Response): Promise<void> {
        try {
            const regionId = req.query.regionId as string | undefined;
            const result = regionId
                ? await this.service.getMunicipalitiesByRegion(regionId)
                : await this.service.getMunicipalities();
            res.status(200).json({ data: result });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur GetTerritoryController.getMunicipalities:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }

    async getDistricts(req: Request, res: Response): Promise<void> {
        try {
            const municipalityId = req.query.municipalityId as string;
            if (!municipalityId) {
                res.status(400).json({ error: 'Paramètre municipalityId requis' });
                return;
            }
            const result = await this.service.getDistrictsByMunicipality(municipalityId);
            res.status(200).json({ data: result });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur GetTerritoryController.getDistricts:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }

    async getNeighborhoods(req: Request, res: Response): Promise<void> {
        try {
            const districtId = req.query.districtId as string;
            if (!districtId) {
                res.status(400).json({ error: 'Paramètre districtId requis' });
                return;
            }
            const result = await this.service.getNeighborhoodsByDistrict(districtId);
            res.status(200).json({ data: result });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur GetTerritoryController.getNeighborhoods:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }

    async getUserBoundary(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            
            if (!userId) {
                res.status(401).json({ error: 'Utilisateur non authentifié' });
                return;
            }

            const result = await this.service.getUserBoundary(userId);
            res.status(200).json({ data: result });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur GetTerritoryController.getUserBoundary:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }

    async getGeoJson(req: Request, res: Response): Promise<void> {
        try {
            const level = req.params.level as TerritoryGeoJsonLevel;
            if (!GEOJSON_LEVELS.includes(level)) {
                res.status(400).json({ error: 'Niveau territorial invalide' });
                return;
            }

            const tolerance = req.query.tolerance !== undefined
                ? Number(req.query.tolerance)
                : undefined;

            if (tolerance !== undefined && (isNaN(tolerance) || tolerance < 0)) {
                res.status(400).json({ error: 'Paramètre tolerance invalide' });
                return;
            }

            const result = await this.service.getGeoJson(level, {
                tolerance,
                regionId: req.query.regionId as string | undefined,
                municipalityId: req.query.municipalityId as string | undefined,
                districtId: req.query.districtId as string | undefined,
            });
            res.status(200).json({ data: result });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur GetTerritoryController.getGeoJson:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }

    async reverseGeocode(req: Request, res: Response): Promise<void> {
        try {
            const { lat, lng } = req.query;
            if (!lat || !lng) {
                res.status(400).json({ error: 'Paramètres lat et lng requis' });
                return;
            }

            const latitude = Number(lat);
            const longitude = Number(lng);

            if (isNaN(latitude) || isNaN(longitude)) {
                res.status(400).json({ error: 'Paramètres lat et lng doivent être des nombres' });
                return;
            }

            const result = await this.service.reverseGeocode(longitude, latitude);
            res.status(200).json({ data: result });
        } catch (error: any) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur GetTerritoryController.reverseGeocode:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }
}
