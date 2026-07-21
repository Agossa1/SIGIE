import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'hse_terra',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT || 5432),
};

const TEAMS = [
    { name: 'Brigade Cotonou Centre', mun: 'COTONOU', users: ['technician@test.com', 'teamleader@test.com'] },
    { name: 'Brigade Porto-Novo', mun: 'PORTO-NOVO', users: ['supervisor@test.com'] },
    { name: 'Brigade Parakou Nord', mun: 'PARAKOU', users: ['platform@test.com', 'technician@test.com'] },
    { name: 'Equipe Assainissement Atlantique', mun: 'COTONOU', users: ['dst@test.com'] },
];

async function main() {
    console.log('🚛 Création des équipes de test...\n');
    const pool = new Pool(DB);
    const client = await pool.connect();

    try {
        await client.query('SELECT 1');
        console.log('✅ Connexion OK\n');

        let teamCount = 0;
        let memberCount = 0;

        for (const team of TEAMS) {
            const mun = await client.query('SELECT id, region_id FROM municipalities WHERE LOWER(name) = $1', [team.mun.toLowerCase()]);
            if (mun.rows.length === 0) { console.log(`   ⚠️  Commune "${team.mun}" non trouvée`); continue; }
            const m = mun.rows[0];

            const existing = await client.query('SELECT id FROM field_teams WHERE name = $1', [team.name]);
            let teamId: string;
            if (existing.rows.length > 0) {
                teamId = existing.rows[0].id;
                await client.query('UPDATE field_teams SET status=$1, municipality_id=$2, region_id=$3 WHERE id=$4', ['active', m.id, m.region_id, teamId]);
            } else {
                const res = await client.query(`INSERT INTO field_teams (id, name, municipality_id, region_id, status) VALUES (gen_random_uuid(), $1, $2, $3, 'active') RETURNING id`, [team.name, m.id, m.region_id]);
                teamId = res.rows[0].id;
            }
            teamCount++;
            console.log(`   ✅ ${team.name} (${team.mun})`);

            for (const email of team.users) {
                const u = await client.query('SELECT id FROM users WHERE LOWER(email)=LOWER($1)', [email]);
                if (u.rows.length === 0) { console.log(`      ⚠️  ${email} non trouvé`); continue; }
                await client.query('INSERT INTO team_members (id, team_id, user_id) VALUES (gen_random_uuid(), $1, $2) ON CONFLICT (team_id, user_id) DO NOTHING', [teamId, u.rows[0].id]);
                memberCount++;
                console.log(`      👤 ${email}`);
            }
        }

        console.log(`\n📊 ${teamCount} équipes, ${memberCount} membres\n`);
    } catch (e: any) { console.error('❌', e.message); process.exit(1); }
    finally { client.release(); await pool.end(); }
}

main();