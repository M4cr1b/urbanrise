import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Client } = require('pg');
const { loadEnvConfig } = require('@next/env');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnvConfig(root);
const mode = process.argv[2] ?? 'preview';
assert(['inspect', 'preview', 'apply'].includes(mode), 'Use inspect, preview or apply');
assert(process.env.SUPABASE_DB_URL, 'SUPABASE_DB_URL is required');
const migration = '0023_add_compound_house_type.sql';
const sql = fs.readFileSync(path.join(root, 'supabase/migrations', migration), 'utf8');
const audit = path.join(root, '.shots/compound-house-support');
fs.mkdirSync(audit, { recursive: true });
const connection = new URL(process.env.SUPABASE_DB_URL);
const poolerHost = process.argv.find(arg => arg.startsWith('--pooler-host='))?.slice('--pooler-host='.length);
if (poolerHost) {
  assert(/^aws-\d-[a-z]+-[a-z]+-\d\.pooler\.supabase\.com$/.test(poolerHost), 'Invalid pooler hostname');
  connection.hostname = poolerHost;
  connection.username = 'postgres.' + new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
  connection.port = '5432';
}
const client = new Client({ connectionString: connection.toString(), ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 20000, statement_timeout: 30000 });
const previousTypes = ['House', 'Apartment', 'Townhouse', 'Duplex', 'Villa', 'Mansion', 'Bungalow'];
const allTypes = [...previousTypes, 'Compound House'];
const definition = async () => {
  const result = await client.query("select pg_get_constraintdef(oid) as definition from pg_constraint where conrelid='public.properties'::regclass and conname='properties_type_check'");
  assert.equal(result.rows.length, 1, 'Expected the existing property type constraint');
  return result.rows[0].definition;
};
const allowedTypes = value => [...value.matchAll(/'([^']+)'/g)].map(match => match[1]).sort();
const snapshot = async () => {
  const { rows } = await client.query('select * from public.properties order by id');
  return { rows: rows.length, sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
};
let transaction = false;
try {
  await client.connect();
  if (mode === 'inspect') {
    console.log(JSON.stringify({ constraint: await definition(), properties: (await snapshot()).rows }, null, 2));
  } else {
    await client.query('begin'); transaction = true;
    await client.query("set local lock_timeout = '5s'");
    await client.query('lock table public.properties in access exclusive mode');
    const before = await snapshot();
    const previousConstraint = await definition();
    const existing = allowedTypes(previousConstraint);
    assert.deepEqual(existing.filter(type => type !== 'Compound House'), [...previousTypes].sort(), 'The live type set differs from the reviewed migration; stop for inspection');
    fs.writeFileSync(path.join(audit, 'before-' + mode + '.json'), JSON.stringify({ migration, previousConstraint, before }, null, 2));
    await client.query(sql);
    const updatedConstraint = await definition();
    assert.deepEqual(allowedTypes(updatedConstraint), [...allTypes].sort(), 'Unexpected allowed property types');
    // Test the exact live CHECK on a temporary table; no listing rows are edited.
    await client.query('create temporary table compound_house_type_probe (type text ' + updatedConstraint + ') on commit drop');
    for (const type of allTypes) await client.query('insert into compound_house_type_probe(type) values($1)', [type]);
    await client.query('savepoint invalid_type');
    let rejected = false;
    try { await client.query('insert into compound_house_type_probe(type) values($1)', ['Unsupported Property Type']); }
    catch (error) { rejected = error.code === '23514'; }
    await client.query('rollback to savepoint invalid_type');
    assert(rejected, 'Unsupported types must remain rejected');
    const after = await snapshot();
    assert.deepEqual(after, before, 'Existing listing rows changed');
    if (mode === 'apply') {
      await client.query('create table if not exists public.schema_migrations(filename text primary key, applied_at timestamptz not null default now())');
      await client.query('insert into public.schema_migrations(filename) values($1) on conflict(filename) do nothing', [migration]);
      await client.query('commit');
    } else await client.query('rollback');
    transaction = false;
    const result = { mode, migration, applied: mode === 'apply', propertiesUnchanged: after.rows, listingRowsUnchanged: true, acceptedTypesVerified: allTypes, invalidTypeRejected: true, constraint: mode === 'apply' ? await definition() : previousConstraint };
    fs.writeFileSync(path.join(audit, mode + '-verification.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  }
} catch (error) {
  if (transaction) await client.query('rollback').catch(() => {});
  console.error(error.message); process.exitCode = 1;
} finally { await client.end().catch(() => {}); }
