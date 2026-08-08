import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const installed = await client.query(
  `select extname, extversion from pg_extension order by extname;`,
);
console.log("--- installed extensions ---");
console.log(installed.rows);

const available = await client.query(
  `select name, default_version from pg_available_extensions where name in ('pgmq','pg_cron','pg_net','vector') order by name;`,
);
console.log("\n--- availability of pgmq/pg_cron/pg_net/vector ---");
console.log(available.rows);

await client.end();
