const { Client } = require('pg');

const client = new Client({ 
  connectionString: 'postgresql://postgres:athena.leeds2026@db.ivyaeoqlkejlwxdbvebv.supabase.co:5432/postgres', 
  ssl: { rejectUnauthorized: false } 
});

async function run() {
  try {
    await client.connect();
    console.log("Adding section_name to student_submissions...");
    
    await client.query(`
      ALTER TABLE student_submissions 
      ADD COLUMN IF NOT EXISTS section_name text;
    `);
    
    console.log('Column section_name added successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
