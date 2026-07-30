import "server-only";

import { neon } from "@neondatabase/serverless";

/**
 * The one connection to Neon.
 *
 * Resolved lazily rather than at import time so a build without `DATABASE_URL`
 * still succeeds. Nothing is prerendered that touches the database, so the
 * variable is only ever needed while serving a real request.
 */
let client: ReturnType<typeof neon> | null = null;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  client ??= neon(url);
  return client;
}

export type SignupRow = {
  id: number;
  name: string;
  country: string;
  gender: "female" | "male" | "neutral";
  seed: string;
  created_at: string;
};

/** Newest first. Returns an empty list rather than throwing when Neon is down. */
export async function recentSignups(limit = 200): Promise<SignupRow[]> {
  const sql = db();
  const rows = await sql`
    select id, name, country, gender, seed, created_at
    from signups
    order by created_at desc
    limit ${limit}
  `;
  return rows as SignupRow[];
}
