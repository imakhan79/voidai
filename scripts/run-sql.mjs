// One-off/dev utility: run a raw SQL file against DATABASE_URL.
// Usage: DATABASE_URL=postgresql://... node scripts/run-sql.mjs supabase/migrations/0001_init.sql
import { readFileSync } from "node:fs";
import pg from "pg";

const { Client } = pg;

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/run-sql.mjs <path-to-sql-file>");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL env var is required");
  process.exit(1);
}

const sql = readFileSync(filePath, "utf-8");

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log(`Connected. Running ${filePath} ...`);
  await client.query(sql);
  console.log("Success.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
