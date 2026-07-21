import { Router } from 'express';
import { getNatureController } from '../controllers/get-nature.controller';
import { NatureRepository } from '../repositories/nature.repository';
import { GetNatureService } from '../services/get-nature.service';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { createLogger, format, transports } from 'winston';
import { authMiddleware } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';

export const natureRouter = (db: PostgresDatabase) => {
    const router = Router();

    const logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [new transports.Console()],
    });

    const repository = new NatureRepository(db, logger);
    const getNatureService = new GetNatureService(repository);

    // GET /nature/geojson/:type — Récupérer les données dynamiques de nature (zones protégées, flore, etc.)
    router.get(
        '/geojson/:type',
        authMiddleware,
        getNatureController(getNatureService)
    );

    return router;
};
