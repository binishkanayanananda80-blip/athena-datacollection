const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:athena.leeds2026@db.ivyaeoqlkejlwxdbvebv.supabase.co:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to database...");
    await client.connect();

    console.log("Reading schema.sql...");
    const schemaSql = fs.readFileSync(path.join(__dirname, 'supabase', 'schema.sql'), 'utf8');
    
    console.log("Executing schema.sql...");
    await client.query(schemaSql);
    console.log("Schema created successfully.");

    console.log("Reading seed.sql...");
    const seedSql = fs.readFileSync(path.join(__dirname, 'supabase', 'seed.sql'), 'utf8');
    
    console.log("Executing seed.sql...");
    await client.query(seedSql);
    console.log("Seed data inserted successfully.");

  } catch (error) {
    console.error("Error executing SQL:", error);
  } finally {
    await client.end();
  }
}

run();
