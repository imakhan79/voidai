import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const discoveryId = process.argv[2];

const jobs = await client.query(
  `select id, status, requested_agents, error, created_at from research_jobs where discovery_id = $1 order by created_at desc limit 3;`,
  [discoveryId],
);
console.log("--- research_jobs ---");
console.log(jobs.rows);

const runs = await client.query(
  `select id, agent_type, status, summary, error from agent_runs where discovery_id = $1 order by created_at desc limit 6;`,
  [discoveryId],
);
console.log("\n--- agent_runs ---");
console.log(runs.rows);

const gaps = await client.query(
  `select id, title, status from gaps where discovery_id = $1 order by created_at desc limit 10;`,
  [discoveryId],
);
console.log("\n--- gaps ---");
console.log(gaps.rows);

const evidenceCount = await client.query(
  `select count(*) from evidence where discovery_id = $1;`,
  [discoveryId],
);
console.log("\n--- evidence count ---", evidenceCount.rows[0]);

await client.end();
