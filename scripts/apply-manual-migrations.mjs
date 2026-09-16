// Applies the idempotent SQL in prisma/migrations/manual/ to DATABASE_URL.
// Usage (on the server, before build+restart): node scripts/apply-manual-migrations.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";
import "dotenv/config";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "prisma", "migrations", "manual");

const url = process.env.DATABASE_URL;
if (!url || url.startsWith("file:")) {
  console.error("DATABASE_URL is missing or not a Postgres URL — aborting.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    const sql = readFileSync(path.join(dir, file), "utf8");
    process.stdout.write(`Applying ${file}… `);
    await client.query(sql);
    console.log("done.");
  }
} finally {
  await client.end();
}
