import PostgresDatabase from '../../../apps/backend/src/infra/database/postgres';
import { configureTeamsRoutes } from './routes/teams.routes';

/**
 * Initialise le module Teams (Brigades) en retournant son routeur configuré.
 * Suit la convention de nommage setup[Module]Module du projet.
 * @param db Instance de la base de données
 */
export const setupTeamsModule = (db: PostgresDatabase) => {
    return configureTeamsRoutes(db);
};