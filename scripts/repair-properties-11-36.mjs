import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Client } = require('pg');
const { loadEnvConfig } = require('@next/env');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnvConfig(root);
const mode = process.argv[2] ?? 'inspect';
assert(['inspect', 'preview', 'apply', 'verify'].includes(mode), 'Use inspect, preview, apply or verify');
const auditDir = path.join(root, 'reports/property-audit-11-36');
fs.mkdirSync(auditDir, {recursive:true});
const reference = JSON.parse(fs.readFileSync(path.join(root, 'data/property-reference-11-36.json'), 'utf8'));
const expected = reference.properties;
const manifest = expected.map(p => ({number:p.number,slug:p.slug}));
assert.equal(manifest.length, 26, 'Expected exactly properties 11–36');
assert(manifest.every((p, i) => p.number === 11 + i), 'Incorrect property range');
const ids = manifest.map(p => p.slug);
const migration = '0022_correct_properties_11_36.sql';
const connection = new URL(process.env.SUPABASE_DB_URL);
const poolerHost = process.argv.find(arg => arg.startsWith('--pooler-host='))?.split('=')[1];
if (poolerHost) {
  assert(/^aws-\d-[a-z]+-[a-z]+-\d\.pooler\.supabase\.com$/.test(poolerHost), 'Invalid pooler hostname');
  connection.hostname = poolerHost;
  connection.username = 'postgres.' + new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
  connection.port = '5432';
}
const client = new Client({connectionString: connection.toString(), ssl: {rejectUnauthorized:false}, connectionTimeoutMillis:20000, statement_timeout:30000});
const save = (filename, value) => fs.writeFileSync(path.join(auditDir, filename), JSON.stringify(value, null, 2));
async function snapshot() {
  const properties = (await client.query('select * from properties order by id')).rows;
  const agents = (await client.query('select * from agents order by id')).rows;
  const media = (await client.query('select * from property_media order by property_id, sort, url, id')).rows;
  const features = (await client.query('select * from property_green_features order by property_id, label')).rows;
  return {properties, agents, media, features};
}
function verify(before, after) {
  assert.equal(after.properties.filter(p => ids.includes(p.id)).length, 26);
  for (const p of after.properties.filter(p => ids.includes(p.id))) {
    assert.equal(p.tenure, 'Leasehold', p.id + ': tenure');
    assert.equal(p.remaining_lease_terms, 'Not specified', p.id + ': remaining term');
    const source = expected.find(s => s.slug === p.id);
    const agent = after.agents.find(a => a.id === p.agent_id);
    const documented = (source.fields.CONTACT.match(/\+?233\d{9}/g) ?? []).map(n => n.replace(/\D/g, '')).sort();
    const actual = [agent.phone, agent.secondary_phone].filter(Boolean).map(n => n.replace(/\D/g, '')).sort();
    assert.deepEqual(actual, documented, p.id + ': exact documented phone set');
    const images = after.media.filter(m => m.property_id === p.id);
    assert.equal(new Set(images.map(m => m.url)).size, images.length, p.id + ': repeated gallery URL');
    const local = fs.readdirSync(path.join(root, 'public/properties', p.id)).filter(f => f.endsWith('.webp'));
    assert.equal(images.length, local.length, p.id + ': media/file count');
    for (const m of images) assert(fs.existsSync(path.join(root, 'public', m.url)), 'Missing media file ' + m.url);
    assert.deepEqual(images.map(m => m.url), source.images.map(m => m.url), p.id + ': verified gallery order');
    for (const image of source.images) {
      const bytes = fs.readFileSync(path.join(root, 'public', image.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256, p.id + ': source photograph integrity');
    }
  }
  const prop36 = after.properties.find(p => p.id === 'achimota-mile7-townhouse-kingscity');
  assert.equal(prop36.district, 'Okaikwei North Municipal District', 'User-confirmed property 36 district');
  for (const p of before.properties) {
    const actual = after.properties.find(a => a.id === p.id);
    const allowed = ids.includes(p.id) ? ['tenure', 'updated_at', ...(p.id === 'achimota-mansion-greenyard' ? ['summary'] : [])] : [];
    for (const key of Object.keys(p)) if (!allowed.includes(key)) assert.deepEqual(actual[key], p[key], p.id + ': unintended field change ' + key);
  }
  assert.equal(after.properties.length, before.properties.length, 'No properties added or removed');
  assert.deepEqual(after.media.filter(m => !ids.includes(m.property_id)), before.media.filter(m => !ids.includes(m.property_id)), 'Unrelated media unchanged');
  assert.deepEqual(after.features, before.features, 'Green features unchanged');
  for (const agent of before.agents) {
    const actual = after.agents.find(a => a.id === agent.id);
    for (const key of Object.keys(agent)) if (key !== 'secondary_phone') assert.deepEqual(actual[key], agent[key], 'Unexpected agent field change ' + agent.name);
    const allowedAgent = ['Save Hands Properties', 'Justice', 'Seekers Realty'].includes(agent.firm);
    if (!allowedAgent) assert.equal(actual.secondary_phone, agent.secondary_phone, 'Unrelated agent phone changed');
  }
}
let inTransaction = false;
try {
  await client.connect();
  if (mode === 'inspect') {
    const before = await snapshot();
    assert.equal(before.properties.filter(p => ids.includes(p.id)).length, 26, 'Wrong or incomplete database');
    save('database-before-repair.json', before);
    const constraints = (await client.query("select conname, pg_get_constraintdef(oid) as definition from pg_constraint where conrelid in ('properties'::regclass,'property_media'::regclass) order by conname")).rows;
    const applied = (await client.query('select filename from schema_migrations order by filename')).rows;
    save('database-schema-before-repair.json', {constraints, applied});
    console.log(JSON.stringify({properties:before.properties.length,targetProperties:26,targetMedia:before.media.filter(m=>ids.includes(m.property_id)).length,constraints,applied},null,2));
  } else if (mode === 'verify') {
    const before = JSON.parse(fs.readFileSync(path.join(auditDir,'database-before-repair.json'),'utf8'));
    // JSON snapshots serialize timestamps; normalize the new snapshot the same way.
    const after = JSON.parse(JSON.stringify(await snapshot()));
    verify(before, after);
    save('database-after-repair.json', after);
    console.log('Verified all 26 properties, exact documented phone sets, unique galleries and unchanged unrelated fields.');
  } else {
    await client.query('begin'); inTransaction = true;
    await client.query("select pg_advisory_xact_lock(hashtext('urbanrise:repair-properties-11-36'))");
    const before = await snapshot();
    const already = (await client.query('select 1 from schema_migrations where filename=$1',[migration])).rowCount;
    assert.equal(already, 0, 'Correction migration was already applied; use verify');
    await client.query(fs.readFileSync(path.join(root,'supabase/migrations',migration),'utf8'));
    const after = await snapshot();
    verify(before, after);
    // Re-execute before committing to prove idempotency, including the uniqueness guard.
    await client.query(fs.readFileSync(path.join(root,'supabase/migrations',migration),'utf8'));
    assert.deepEqual(await snapshot(), after, 'Migration must be idempotent');
    const existingImage = after.media.find(m => ids.includes(m.property_id));
    await client.query('savepoint duplicate_media_guard');
    let duplicateRejected = false;
    try {
      await client.query('insert into property_media(property_id,url,sort) values($1,$2,$3)',[existingImage.property_id,existingImage.url,existingImage.sort]);
    } catch (error) {
      duplicateRejected = error.code === '23505' && error.constraint === 'property_media_audited_property_url_key';
    } finally {
      await client.query('rollback to savepoint duplicate_media_guard');
      await client.query('release savepoint duplicate_media_guard');
    }
    assert(duplicateRejected, 'Database must reject repeated image URLs for audited properties');
    const summary = {mode,propertiesCorrected:26,mediaRowsRemoved:before.media.length-after.media.length,secondaryPhonesAdded:after.agents.filter(a=>before.agents.find(b=>b.id===a.id)?.secondary_phone!==a.secondary_phone).map(a=>({agent:a.name,secondaryPhone:a.secondary_phone})),property36District:after.properties.find(p=>p.id==='achimota-mile7-townhouse-kingscity').district};
    if (mode === 'apply') {
      save('database-before-repair.json', before);
      await client.query('insert into schema_migrations(filename) values($1)',[migration]);
      await client.query('commit'); inTransaction = false;
      save('database-after-repair.json', after);
    } else {
      await client.query('rollback'); inTransaction = false;
      assert.deepEqual(await snapshot(),before,'Preview must leave no persistent changes');
    }
    save(mode+'-repair-result.json', summary);
    console.log(JSON.stringify(summary,null,2));
  }
} catch (error) {
  if (inTransaction) await client.query('rollback').catch(()=>{});
  console.error(error.message);
  process.exitCode = 1;
} finally { await client.end().catch(()=>{}); }
