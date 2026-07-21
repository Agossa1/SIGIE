import {UploadGisLayerService} from '../services/create.service';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import fs from 'fs';
import * as shp from 'shpjs';

/**
 * POST /gis
 * Body (FormData): { name, layerType, description?, municipalityId? }
 * File: file (GeoJSON or ZIP Shapefile)
 */
export const uploadGisLayerController = (service: UploadGisLayerService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let filePath: string | undefined;
        try {
            const { name, layerType, description, municipalityId } = req.body;
            const file = req.file;

            if (!name || !layerType || !file) {
                throw new BadRequestError('name, layerType et file sont obligatoires');
            }

            filePath = file.path;
            const fileContent = fs.readFileSync(filePath);
            let geojson: any;

            if (file.originalname.toLowerCase().endsWith('.zip')) {
                // Traitement Shapefile ZIP
                const parsed = await shp.parseZip(fileContent);
                if (Array.isArray(parsed)) {
                    geojson = {
                        type: "FeatureCollection",
                        features: parsed.flatMap((g: any) => g.features)
                    };
                } else {
                    geojson = parsed;
                }
            } else {
                // Traitement GeoJSON
                geojson = JSON.parse(fileContent.toString());
            }

            const userId = req.user?.id;
            const result = await service.execute({
                name,
                layerType,
                description,
                municipalityId,
                createdBy: userId,
                geojson,
            });

            // Supprimer le fichier temporaire après traitement réussi
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            res.status(201).json({
                success: true,
                data: result,
                message: `Couche "${name}" importée avec ${result.featureCount} feature(s)`,
            });
        } catch (error) {
            // Supprimer le fichier temporaire en cas d'erreur
            if (filePath && fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) {}
            }
            next(error);
        }
    };
};
