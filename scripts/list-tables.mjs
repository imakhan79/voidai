import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const res = await client.query(
  `select table_name from information_schema.tables where table_schema = 'public' order by table_name;`,
);
console.log(res.rows.map((r) => r.table_name).join("\n"));

const policies = await client.query(
  `select tablename, policyname from pg_policies where schemaname = 'public' order by tablename, policyname;`,
);
console.log("\n--- RLS policies ---");
console.log(policies.rows.map((r) => `${r.tablename}: ${r.policyname}`).join("\n"));

await client.end();
