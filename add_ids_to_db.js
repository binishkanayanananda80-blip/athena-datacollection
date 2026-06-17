const { Client } = require('pg');

const client = new Client({ 
  connectionString: 'postgresql://postgres:athena.leeds2026@db.ivyaeoqlkejlwxdbvebv.supabase.co:5432/postgres', 
  ssl: { rejectUnauthorized: false } 
});

async function run() {
  try {
    await client.connect();
    console.log("Adding columns to student_submissions...");
    
    // Using IF NOT EXISTS to prevent errors if running multiple times
    await client.query(`
      ALTER TABLE student_submissions 
      ADD COLUMN IF NOT EXISTS section_id integer,
      ADD COLUMN IF NOT EXISTS grade_id integer,
      ADD COLUMN IF NOT EXISTS class_id integer;
    `);
    
    console.log('Columns added successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
