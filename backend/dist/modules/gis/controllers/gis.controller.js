"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGisLayerController = exports.getGisLayerGeoJsonController = exports.getGisLayersController = exports.uploadGisLayerController = void 0;
/**
 * POST /gis
 * Body: { name, layerType, description?, municipalityId?, geojson: FeatureCollection }
 */
const uploadGisLayerController = (service) => {
    return async (req, res, next) => {
        try {
            const { name, layerType, description, municipalityId, geojson } = req.body;
            if (!name || !layerType || !geojson) {
                res.status(400).json({ success: false, message: 'name, layerType et geojson sont obligatoires' });
                return;
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
            res.status(201).json({
                success: true,
                data: result,
                message: `Couche "${name}" importée avec ${result.featureCount} feature(s)`,
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.uploadGisLayerController = uploadGisLayerController;
/**
 * GET /gis
 * Retourne la liste de toutes les couches SIG.
 */
const getGisLayersController = (service) => {
    return async (req, res, next) => {
        try {
            const layers = await service.getLayers();
            res.status(200).json({ success: true, data: layers });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.getGisLayersController = getGisLayersController;
/**
 * GET /gis/:id/geojson
 * Retourne une couche complète sous forme de FeatureCollection GeoJSON.
 */
const getGisLayerGeoJsonController = (service) => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            const geojson = await service.getLayerGeoJson(id);
            if (!geojson) {
                res.status(404).json({ success: false, message: 'Couche introuvable' });
                return;
            }
            res.status(200).json({ success: true, data: geojson });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.getGisLayerGeoJsonController = getGisLayerGeoJsonController;
/**
 * DELETE /gis/:id
 */
const deleteGisLayerController = (service) => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            await service.execute(id);
            res.status(200).json({ success: true, message: 'Couche supprimée' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.deleteGisLayerController = deleteGisLayerController;
//# sourceMappingURL=gis.controller.js.map