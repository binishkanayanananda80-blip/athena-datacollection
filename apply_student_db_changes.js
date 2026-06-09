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

    console.log("Reading student_schema.sql...");
    const schemaSql = fs.readFileSync(path.join(__dirname, 'supabase', 'student_schema.sql'), 'utf8');
    
    console.log("Executing student_schema.sql...");
    await client.query(schemaSql);
    console.log("Student Schema created successfully.");

  } catch (error) {
    console.error("Error executing SQL:", error);
  } finally {
    await client.end();
  }
}

run();
