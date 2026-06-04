const { Client } = require('pg');

const connectionString = 'postgresql://postgres:athena.leeds2026@db.ivyaeoqlkejlwxdbvebv.supabase.co:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to database...");
    await client.connect();

    console.log("Dropping old global EPF unique index...");
    await client.query(`DROP INDEX IF EXISTS unique_employee_epf;`);

    console.log("Creating new branch-specific EPF unique index...");
    await client.query(`CREATE UNIQUE INDEX unique_employee_branch_epf ON employee_submissions(branch_id, lower(epf_no));`);

    console.log("Database updated successfully.");
  } catch (error) {
    console.error("Error executing SQL:", error);
  } finally {
    await client.end();
  }
}

run();
