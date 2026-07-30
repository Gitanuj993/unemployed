/**
 * Applies content/schema.sql to whatever DATABASE_URL points at.
 *
 * Idempotent (every statement is `if not exists`), so running it twice is safe.
 * This exists instead of a migration tool because there is exactly one table.
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(new URL("../content/schema.sql", import.meta.url), "utf8");

// Split on semicolons that end a statement, ignoring comment-only fragments.
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s && !s.split("\n").every((line) => line.trim().startsWith("--")));

for (const statement of statements) {
  await sql.query(statement);
  console.log("ok:", statement.split("\n")[0].slice(0, 70));
}

const [{ count }] = await sql`select count(*)::int as count from signups`;
console.log(`\nschema applied. signups table holds ${count} row(s).`);
