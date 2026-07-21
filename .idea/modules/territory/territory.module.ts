import { Router } from 'express';
import PostgresDatabase from '../../../apps/backend/src/infra/database/postgres';
import { territoryRouter } from './routes/territory.routes';

/**
 * Module Territoire.
 * Encapsule la hiérarchie administrative et la gestion géospatiale (SIG).
 */
export const setupTerritoryModule = (db: PostgresDatabase): Router => {
    return territoryRouter(db);
};
