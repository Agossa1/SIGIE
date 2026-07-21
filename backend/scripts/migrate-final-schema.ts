/**
 * Script de migration — Application du schéma HSE TERRA final.
 * 
 * Usage :
 *   npm run migrate:final                  → applique sur base propre
 *   npm run migrate:final -- --reset       → DROP tout puis applique
 *   npm run migrate:final -- --dry-run     → preview
 * 
 * Configuré via .env :
 *   DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT
 */

import fs from 'fs';
import path from 'path';
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ── Config ─────────────────────────────────────────────────────────────────
const DB = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'hse_terra',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT || 5432),
};

const SCHEMA_FILE = path.join(__dirname, '..', 'src', 'infra', 'migrations', '00_final_schema.sql');

// ── Logging coloré ─────────────────────────────────────────────────────────
const C = { r: '\x1b[0m', b: '\x1b[1m', red: '\x1b[31m', grn: '\x1b[32m', yel: '\x1b[33m', blu: '\x1b[34m', cyn: '\x1b[36m', gry: '\x1b[90m' };
const log = {
  i: (m: string) => console.log(`${C.blu}ℹ${C.r} ${m}`),
  ok: (m: string) => console.log(`${C.grn}✅${C.r} ${m}`),
  w: (m: string) => console.log(`${C.yel}⚠️${C.r} ${m}`),
  e: (m: string) => console.log(`${C.red}❌${C.r} ${m}`),
  s: (m: string) => console.log(`${C.cyn}→${C.r} ${m}`),
};

const args = process.argv.slice(2);
const RESET = args.includes('--reset');
const DRY_RUN = args.includes('--dry-run');

// ── Exécution du SQL en blocs ──────────────────────────────────────────────
async function executeSQL(client: PoolClient, sql: string) {
  // Supprimer les commentaires de début de fichier (lignes --)
  const cleanSQL = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  // Découper sur les séparateurs de section
  const blocks = cleanSQL.split(/-- ={60,}/).filter(b => b.trim().length > 0);

  let success = 0;
  let skipped = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block || block.startsWith('EXTENSIONS') || block.startsWith('FONCTIONS UTILITAIRES')) {
      // Ces blocs sont déjà traités ou contiennent des commentaires uniquement
      continue;
    }

    try {
      await client.query(block);
      success++;
    } catch (err: any) {
      // Ignorer "already exists" (ré-entrance, idempotence)
      if (err.message?.includes('already exists') || err.code === '42710' || err.code === '42P07') {
        skipped++;
        continue;
      }
      // Ignorer "duplicate key" sur les index
      if (err.code === '42P16' || err.message?.includes('duplicate key')) {
        skipped++;
        continue;
      }
      // Ignorer "does not exist" sur DROP IF EXISTS
      if (err.message?.includes('does not exist')) {
        skipped++;
        continue;
      }
      // Erreur réelle
      log.e(`Erreur SQL [${err.code}] au bloc #${i + 1}`);
      const preview = block.substring(0, 120).replace(/\n/g, ' ');
      console.log(`${C.gry}  ${preview}...${C.r}`);
      throw err;
    }
  }

  return { success, skipped };
}

// ── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${C.b}${C.cyn}╔══════════════════════════════════════════════════════╗`);
  console.log(`${C.cyn}║   HSE TERRA — Migration du Schéma Final              ║`);
  console.log(`${C.cyn}╚══════════════════════════════════════════════════════╝${C.r}\n`);

  log.i(`${DB.user}@${DB.host}:${DB.port}/${DB.database}`);
  if (DRY_RUN) log.w('DRY RUN — rien ne sera appliqué');
  if (RESET) log.w('RESET — suppression de toutes les tables avant migration');

  // Vérifier le fichier
  if (!fs.existsSync(SCHEMA_FILE)) {
    log.e(`Fichier introuvable : ${SCHEMA_FILE}`);
    process.exit(1);
  }

  const rawSQL = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const tableCount = (rawSQL.match(/CREATE TABLE (?:IF NOT EXISTS )?\w+/g) || []).length;
  const enumCount = (rawSQL.match(/CREATE TYPE \w+/g) || []).length;
  log.i(`Fichier : ${(rawSQL.length / 1024).toFixed(0)} Ko, ${tableCount} tables, ${enumCount} enums`);

  if (DRY_RUN) {
    console.log(`\n${C.grn}Rien à signaler — le schéma est prêt.${C.r}\n`);
    process.exit(0);
  }

  const pool = new Pool(DB);
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    log.ok('Connexion OK');

    // ── RESET ───────────────────────────────────────────────────────────
    if (RESET) {
      log.s('Nettoyage de la base...');
      // Supprimer toutes les tables
      await client.query(`
        DO $$ DECLARE r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
        END $$;
      `);
      // Supprimer tous les types ENUM customs
      await client.query(`
        DO $$ DECLARE r RECORD;
        BEGIN
          FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace) LOOP
            BEGIN
              EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
          END LOOP;
        END $$;
      `);
      log.ok('Base nettoyée — tables + enums supprimés');
    }

    // ── Appliquer le schéma ─────────────────────────────────────────────
    log.s('Application du schéma...');
    const start = Date.now();

    const { success, skipped } = await executeSQL(client, rawSQL);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    log.ok(`Terminé en ${elapsed}s — ${success} blocs OK${skipped > 0 ? `, ${skipped} ignorés (déjà présents)` : ''}`);

    // ── Vérification ────────────────────────────────────────────────────
    const { rows } = await client.query(
      `SELECT count(*) as c FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
    );
    const actualTables = parseInt(rows[0].c, 10);
    log.ok(`${actualTables} tables dans la base`);

    // ── Résumé final ────────────────────────────────────────────────────
    console.log(`\n${C.b}${C.grn}╔══════════════════════════════════════════════════════╗`);
    console.log(`${C.grn}║   ✅ Migration réussie — ${actualTables} tables                      ║`);
    console.log(`${C.grn}╚══════════════════════════════════════════════════════╝${C.r}\n`);

    console.log(`${C.cyn}📦 Modules disponibles :${C.r}`);
    console.log(`   Territoire    : regions, municipalities, districts, neighborhoods`);
    console.log(`   Auth          : users, roles, permissions, sessions, OTPs, audit`);
    console.log(`   Équipes       : field_teams, team_members, attendance_logs`);
    console.log(`   SIG           : gis_layers, gis_features, risk_zones, infrastructures`);
    console.log(`   Météo         : weather_sources, stations, measurements, alerts`);
    console.log(`   Inondations   : flood_events, predictions, inspections`);
    console.log(`   Opérations    : technician_reports, missions, interventions`);
    console.log(`   Propreté      : waste_points, collections, unsanitary_zones`);
    console.log(`   Routes        : roads, potholes, maintenance_operations`);
    console.log(`   Com           : alerts, notifications, workflows, SLA`);
    console.log(`   Inventaire    : warehouses, inventory_items, suppliers`);
    console.log(`   Mobile        : devices, sync_logs, offline_queue, forms`);
    console.log(`   Analytics     : kpi_metrics, smart_recommendations, dashboards`);
    console.log(`   Environnement : air_quality, water_quality, biodiversity, flora`);

    console.log(`\n${C.cyn}🚀 Recommandations (P0-P2) intégrées :${C.r}`);
    console.log(`   Finance       : budgets, expenditures, donor_projects`);
    console.log(`   Citoyen       : citizen_reports, chatbot_sessions`);
    console.log(`   Alerte        : early_warning_alerts, climate_scenarios, adaptation_plans`);
    console.log(`   Notifications : templates, rules, rule_logs`);
    console.log(`   Marketplace   : service_providers, service_contracts`);
    console.log(`   ODD           : sdg_indicators, sdg_indicator_values, national_dashboard`);
    console.log(`   ML/AI         : ml_training_datasets, ml_model_versions, ml_prediction_logs\n`);

  } catch (err: any) {
    log.e(`Échec : ${err.message}`);
    if (err.position) log.e(`Position SQL ~ ${err.position}`);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();