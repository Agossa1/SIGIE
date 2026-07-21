import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { ProfilesRepository } from './repositories/profiles.repository';
import { GetProfileService } from './services/get-profile.service';
import { UpdateProfileService } from './services/update-profile.service';
import { GetProfileController } from './controllers/get-profile.controller';
import { UpdateProfileController } from './controllers/update-profile.controller';
import { configureProfilesRouter } from './routes/profiles.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module Profiles — Gestion des préférences utilisateur.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureProfilesRoutes(db: PostgresDatabase): Router {
    const repository = new ProfilesRepository(db, logger);

    // Services
    const getProfileService = new GetProfileService(repository);
    const updateProfileService = new UpdateProfileService(repository);

    // Controllers
    const getProfileCtrl = new GetProfileController(getProfileService);
    const updateProfileCtrl = new UpdateProfileController(updateProfileService);

    // Routes
    return configureProfilesRouter(getProfileCtrl, updateProfileCtrl);
}