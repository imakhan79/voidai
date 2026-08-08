import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const users = await client.query(
  `select id, email, created_at from auth.users order by created_at desc limit 3;`,
);
console.log("--- auth.users ---");
console.log(users.rows);

const orgs = await client.query(`select id, name, created_at from public.orgs order by created_at desc limit 3;`);
console.log("\n--- public.orgs ---");
console.log(orgs.rows);

const members = await client.query(
  `select org_id, user_id, role from public.org_members order by created_at desc limit 3;`,
);
console.log("\n--- public.org_members ---");
console.log(members.rows);

await client.end();
