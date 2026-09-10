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

if (!dbUrl) {
  console.error('SUPABASE_DB_URL not configured');
  process.exit(1);
}

const client = new Client({ 
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function checkMigration() {
  try {
    await client.connect();
    console.log('✓ Connected to database\n');
    
    // Check properties count
    const propertiesResult = await client.query(`
      SELECT id, address, asking_price, bedrooms FROM properties 
      WHERE id IN ('cantonments-villa-charclem', 'adjiringanor-mansion-stardom', 'east-legon-trasacco-villa', 'adjiringanor-duplex-hometrust')
      ORDER BY asking_price DESC
    `);
    
    console.log('📦 Properties in Database:');
    if (propertiesResult.rows.length === 0) {
      console.log('  ❌ NO PROPERTIES FOUND - Migration may not have run');
    } else {
      propertiesResult.rows.forEach(prop => {
        console.log(`  ✓ ${prop.id}`);
        console.log(`    Address: ${prop.address} | ${prop.bedrooms}BR | Price: GH₵${prop.asking_price}`);
      });
    }
    
    // Check property media count
    const mediaResult = await client.query(`
      SELECT property_id, COUNT(*) as image_count 
      FROM property_media 
      WHERE property_id IN ('cantonments-villa-charclem', 'adjiringanor-mansion-stardom', 'east-legon-trasacco-villa', 'adjiringanor-duplex-hometrust')
      GROUP BY property_id
      ORDER BY property_id
    `);
    
    console.log('\n🖼️  Property Images:');
    if (mediaResult.rows.length === 0) {
      console.log('  ❌ NO IMAGES FOUND');
    } else {
      mediaResult.rows.forEach(media => {
        console.log(`  ✓ ${media.property_id}: ${media.image_count} images`);
      });
    }
    
    // Check agents
    const agentsResult = await client.query(`
      SELECT firm FROM agents 
      WHERE firm IN ('Charclem Ventures', 'Home Trust Properties Agency', 'Stardom Real Estate')
      ORDER BY firm
    `);
    
    console.log('\n🏢 Agents:');
    if (agentsResult.rows.length === 0) {
      console.log('  ❌ NO AGENTS FOUND');
    } else {
      agentsResult.rows.forEach(agent => {
        console.log(`  ✓ ${agent.firm}`);
      });
    }
    
    console.log('\n---');
    const totalProps = propertiesResult.rows.length;
    const totalImages = mediaResult.rows.reduce((sum, row) => sum + parseInt(row.image_count), 0);
    console.log(`Total: ${totalProps}/4 properties, ${totalImages}/41 images`);
    
    if (totalProps === 0) {
      console.log('\n⚠️  Migration has not been applied yet!');
      console.log('Please run the SQL script in Supabase dashboard.');
    } else if (totalProps === 4 && totalImages === 41) {
      console.log('\n✅ All data is in the database!');
      console.log('Issue may be with the app. Try:');
      console.log('  1. npm run build');
      console.log('  2. npm run dev');
      console.log('  3. Clear browser cache');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkMigration();
