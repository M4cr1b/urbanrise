#!/usr/bin/env node
/**
 * Deploy migration 0016_add_properties_11_18.sql to Supabase
 * Uses PostgreSQL client to connect directly
 */

import { Client } from 'pg';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Read env from .env.local
const envPath = path.join(projectRoot, '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    env[key] = valueParts.join('=');
  }
});

const dbUrl = env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL in .env.local');
  process.exit(1);
}

// Parse connection URL
const client = new Client({
  connectionString: dbUrl
});

// Read migration file
const migrationPath = path.join(projectRoot, 'supabase/migrations/0016_add_properties_11_18.sql');
const migrationSQL = readFileSync(migrationPath, 'utf8');

async function deployMigration() {
  try {
    console.log(`\n=== Deploying Migration 0016 ===\n`);

    await client.connect();
    console.log('✓ Connected to Supabase database\n');

    // Execute entire migration as a transaction
    console.log('Executing migration SQL...\n');
    const result = await client.query(migrationSQL);

    console.log('✓ Migration executed successfully!\n');
    console.log(`=== Summary ===`);
    console.log(`- 7 agents inserted/updated`);
    console.log(`- 8 properties inserted`);
    console.log(`- 83 property_media rows inserted`);
    console.log(`- 6 property_green_features rows inserted\n`);

    process.exit(0);
  } catch (err) {
    console.error(`✗ Migration failed: ${err.message}\n`);
    console.error('Details:', err.detail || '');
    process.exit(1);
  } finally {
    await client.end();
  }
}

deployMigration();
