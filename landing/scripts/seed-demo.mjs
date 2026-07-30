/**
 * Fills the wall with throwaway rows so the hero crowd can be looked at during
 * design work. Not for production: `npm run seed:clear` removes exactly these
 * rows, which are the ones whose ip_hash is 'seed-demo'.
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

if (process.argv.includes("--clear")) {
  await sql`delete from signups where ip_hash = 'seed-demo'`;
  const [{ c }] = await sql`select count(*)::int as c from signups`;
  console.log(`demo rows removed. ${c} real row(s) left.`);
  process.exit(0);
}

const people = [
  ["Aarav", "IN", "male"], ["Priya", "IN", "female"], ["Rohan", "IN", "male"],
  ["Sneha", "IN", "female"], ["Kabir", "IN", "male"], ["Ananya", "IN", "female"],
  ["Wei", "SG", "male"], ["Mariam", "AE", "female"], ["Diego", "MX", "male"],
  ["Lena", "DE", "female"], ["Tom", "GB", "male"], ["Yuki", "JP", "female"],
  ["Sam", "US", "neutral"], ["Fatima", "PK", "female"], ["Arjun", "IN", "male"],
  ["Chloe", "CA", "female"], ["Ravi", "IN", "male"], ["Zara", "GB", "female"],
  ["Ibrahim", "NG", "male"], ["Mei", "TW", "female"], ["Luca", "IT", "male"],
  ["Nadia", "EG", "female"], ["Karan", "IN", "male"], ["Ella", "AU", "female"],
];

for (const [name, country, gender] of people) {
  const seed = Math.random().toString(36).slice(2, 10);
  await sql`
    insert into signups (name, country, gender, seed, ip_hash, client_id)
    values (${name}, ${country}, ${gender}, ${seed}, 'seed-demo', ${"demo-" + name})
    -- The unique index is partial, so its predicate has to be repeated here
    -- for Postgres to match it.
    on conflict (client_id) where client_id is not null do nothing
  `;
}

const [{ c }] = await sql`select count(*)::int as c from signups`;
console.log(`seeded. ${c} row(s) total.`);
