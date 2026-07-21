import { Router } from 'express';
import { uploadGisLayerController } from '../controllers/create.controller';
import { getAllGisLayersController } from '../controllers/get-all.controller';
import { getGisLayerGeoJsonController } from '../controllers/get-geojson.controller';
import { deleteGisLayerController } from '../controllers/delete.controller';
import { updateGisLayerController } from '../controllers/update.controller';
import { GisRepository } from '../repositories/gis.repositories';
import { UploadGisLayerService } from '../services/create.service';
import { GetAllGisLayersService } from '../services/get-all.service';
import { GetGeoJsonLayerService } from '../services/get-geojson.service';
import { DeleteGisLayerService } from '../services/delete.service';
import { UpdateGisLayerService } from '../services/update.service';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { createLogger, format, transports } from 'winston';
import { authMiddleware, requireRole } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';
import { TerritoryRepository } from '../../territory/repositories/territory.repositories';
import { gisUploadMiddleware } from '../../../../apps/backend/src/shared/middlewares/upload.middleware';

export const gisRouter = (db: PostgresDatabase) => {
    const router = Router();

    const logger = createLogger({
        format: format.simple(),
        transports: [new transports.Console()],
    });

    const repository = new GisRepository(db, logger);
    const territoryRepository = new TerritoryRepository(db, logger);
    const uploadService = new UploadGisLayerService(repository, territoryRepository);
    const getAllService = new GetAllGisLayersService(repository);
    const getGeoJsonService = new GetGeoJsonLayerService(repository);
    const deleteService = new DeleteGisLayerService(repository);
    const updateService = new UpdateGisLayerService(repository);

    // POST /gis — Importer un fichier GeoJSON comme couche SIG
    router.post(
        '/',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor']),
        gisUploadMiddleware.single('file'),
        uploadGisLayerController(uploadService)
    );

    // GET /gis — Lister toutes les couches SIG disponibles
    router.get(
        '/',
        authMiddleware,
        getAllGisLayersController(getAllService)
    );

    // GET /gis/:id/geojson — Récupérer les données GeoJSON d'une couche
    router.get(
        '/:id/geojson',
        authMiddleware,
        getGisLayerGeoJsonController(getGeoJsonService)
    );


    // DELETE /gis/:id — Supprimer une couche SIG
    router.delete(
        '/:id',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin']),
        deleteGisLayerController(deleteService)
    );

    // PUT /gis/:id — Mettre à jour une couche SIG
    router.put(
        '/:id',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor']),
        updateGisLayerController(updateService)
    );

    return router;
};
