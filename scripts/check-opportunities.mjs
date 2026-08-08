import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const discoveryId = process.argv[2];

const jobs = await client.query(
  `select status from research_jobs where discovery_id = $1 order by created_at desc limit 1;`,
  [discoveryId],
);
console.log("--- latest job status ---", jobs.rows[0]);

const opps = await client.query(
  `select id, title, opportunity_score, confidence_score from opportunities where discovery_id = $1 order by created_at desc;`,
  [discoveryId],
);
console.log("\n--- opportunities ---");
console.log(opps.rows);

await client.end();
