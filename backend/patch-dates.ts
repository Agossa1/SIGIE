import PostgresDatabase from './src/infra/database/postgres';
import { logger } from './src/shared/loggers/logger';

async function patchDates() {
    const db = new PostgresDatabase();
    await db.connect();

    try {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const res1 = await client.query(`
                UPDATE interventions
                SET started_at = created_at
                WHERE started_at IS NULL
            `);
            console.log(`✅ ${res1.rowCount} interventions mises a jour avec started_at = created_at`);

            const res2 = await client.query(`
                UPDATE interventions
                SET ended_at = created_at + interval '1 hour'
                WHERE status = 'completed' AND ended_at IS NULL
            `);
            console.log(`✅ ${res2.rowCount} interventions terminees mises a jour avec un ended_at`);

            await client.query('COMMIT');
            console.log('✅ Patch des dates termine avec succes.');
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('❌ Erreur lors du patch, rollback effectue', e);
        } finally {
            client.release();
        }
    } catch (e) {
        console.error('❌ Impossible de se connecter a la DB', e);
    } finally {
        await db.close();
    }
}

patchDates();
