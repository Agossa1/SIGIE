import { Request, Response, NextFunction } from 'express';
import { GetGeoJsonLayerService } from '../services/get-geojson.service';
import { NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';

/**
 * GET /gis/:id/geojson
 * Retourne une couche sous forme de FeatureCollection GeoJSON.
 * Query params supportés :
 *   - limit   : nombre max de features (défaut 5000, max 10000)
 *   - offset  : décalage pour la pagination (défaut 0)
 *   - bbox    : filtre spatial "minLng,minLat,maxLng,maxLat"
 */
export const getGisLayerGeoJsonController = (service: GetGeoJsonLayerService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // Pagination
            const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 10000) : 5000;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

            // Filtre spatial optionnel (bbox=minLng,minLat,maxLng,maxLat)
            let bbox: [number, number, number, number] | undefined;
            if (req.query.bbox) {
                const parts = (req.query.bbox as string).split(',').map(Number);
                if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
                    bbox = parts as [number, number, number, number];
                }
            }

            const geojson = await service.execute(id as string, { limit, offset, bbox });
            if (!geojson) {
                throw new NotFoundError('Couche introuvable');
            }

            res.setHeader('X-GIS-Feature-Count', geojson.features.length.toString());
            res.setHeader('X-GIS-Limit', limit.toString());
            res.setHeader('X-GIS-Offset', offset.toString());

            res.status(200).json({ success: true, data: geojson });
        } catch (error) {
            next(error);
        }
    };
};
