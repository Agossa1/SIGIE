import { Router } from 'express';
import PostgresDatabase from '../../../apps/backend/src/infra/database/postgres';
import { natureRouter } from './routes/nature.routes';

/**
 * Point d'entrée principal pour le montage du module Nature dans l'application Express.
 */
export const setupNatureModule = (db: PostgresDatabase): Router => {
    return natureRouter(db);
};
