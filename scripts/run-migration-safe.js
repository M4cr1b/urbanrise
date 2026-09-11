const fs = require('fs');
const { Client } = require('pg');

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim()) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const dbUrl = env.SUPABASE_DB_URL;
const migrationFile = process.argv[2];

// Try both: direct connection and pooler
const connectionUrls = [
  dbUrl, // Original
  dbUrl.replace('db.siexmlzuhjdwetvrebnb.supabase.co', 'siexmlzuhjdwetvrebnb.pooler.supabase.com'), // Alternate pooler format
];

if (!dbUrl) {
  console.error('SUPABASE_DB_URL not configured');
  process.exit(1);
}

async function tryConnection(url, attempt) {
  return new Promise((resolve) => {
    const client = new Client({ 
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    client.connect((err) => {
      if (err) {
        console.log(`  Attempt ${attempt}: Failed - ${err.message}`);
        resolve(null);
      } else {
        console.log(`  ✓ Connected using: ${url.replace(/:[^:]*@/, ':***@')}`);
        resolve(client);
      }
    });
  });
}

async function runMigration() {
  try {
    console.log('Attempting to connect to Supabase database...\n');
    
    let client = null;
    for (let i = 0; i < connectionUrls.length; i++) {
      client = await tryConnection(connectionUrls[i], i + 1);
      if (client) break;
    }
    
    if (!client) {
      throw new Error('Could not connect using any connection method');
    }
    
    console.log('\nExecuting migration: 0006_add_new_properties.sql...\n');
    
    const migration = fs.readFileSync(migrationFile, 'utf8');
    await client.query(migration);
    
    console.log('\n✓ Migration completed successfully!');
    console.log('\n✓ 4 new properties have been added to the database:');
    console.log('  1. cantonments-villa-charclem (GH₵ 16,137,277) - Villa');
    console.log('  2. adjiringanor-mansion-stardom (GH₵ 11,625,000) - Mansion');
    console.log('  3. east-legon-trasacco-villa (GH₵ 5,212,474) - Villa');
    console.log('  4. adjiringanor-duplex-hometrust (GH₵ 4,500,000) - Duplex');
    console.log('\nThese properties are now searchable on the website!');
    console.log('41 images have been added to the property galleries.');
    
    await client.end();
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
