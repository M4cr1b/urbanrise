const fs = require('fs');
const { Client } = require('pg');

const dbUrl = process.env.SUPABASE_DB_URL;
const migrationFile = process.argv[2];

if (!dbUrl) {
  console.error('SUPABASE_DB_URL environment variable not set');
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

async function runMigration() {
  try {
    await client.connect();
    const migration = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration: 0006_add_new_properties.sql...\n');
    await client.query(migration);
    
    console.log('✓ Migration completed successfully!');
    console.log('\n✓ 4 new properties have been added to the database:');
    console.log('  - cantonments-villa-charclem (GH₵ 16,137,277)');
    console.log('  - adjiringanor-mansion-stardom (GH₵ 11,625,000)');
    console.log('  - east-legon-trasacco-villa (GH₵ 5,212,474)');
    console.log('  - adjiringanor-duplex-hometrust (GH₵ 4,500,000)');
    
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
