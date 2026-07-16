const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Use NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to construct a URL if connection string isn't direct, 
// or just use the same connection string from apply_db_changes.js since it's hardcoded there.
const connectionString = 'postgresql://postgres:athena.leeds2026@db.ivyaeoqlkejlwxdbvebv.supabase.co:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to database...");
    await client.connect();

    const schemaSql = fs.readFileSync(path.join(__dirname, 'supabase', 'furniture_schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'supabase', 'furniture_seed.sql'), 'utf8');

    console.log("Applying furniture_schema.sql...");
    await client.query(schemaSql);
    console.log("Schema applied successfully.");

    console.log("Applying furniture_seed.sql...");
    await client.query(seedSql);
    console.log("Seed data applied successfully.");

  } catch (error) {
    console.error("Error executing SQL:", error);
  } finally {
    await client.end();
  }
}

run();
