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
  // bigint, which the driver hands back as a string rather than a number.
  id: string;
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

export type ExperienceRound = {
  round_number: number;
  round_type: string;
  description: string;
  outcome: string;
};

export type ExperienceRow = {
  id: string;
  company: string;
  role: string;
  result: string;
  summary: string;
  created_at: string;
  // Who posted it. `signup_id` is what lets the wall ask for one person's
  // experiences without loading everyone's and filtering in the browser.
  signup_id: string;
  name: string;
  seed: string;
  gender: "female" | "male" | "neutral";
  rounds: ExperienceRound[];
};

/**
 * The row a Google account owns, or null if they signed in but never finished
 * their profile. Signing in and being on the wall are two different things:
 * the first is Google's answer, the second is a row here.
 */
export async function signupForGoogleSub(sub: string): Promise<SignupRow | null> {
  const sql = db();
  const rows = (await sql`
    select id, name, country, gender, seed, created_at
    from signups where google_sub = ${sub} limit 1
  `) as SignupRow[];
  return rows[0] ?? null;
}

/**
 * Newest first, optionally filtered by company (case-insensitive prefix
 * match) or by the person who posted them. Rounds come back nested via
 * json_agg so this is one round trip instead of N+1.
 */
export async function recentExperiences({
  company,
  signupId,
  limit = 100,
}: {
  company?: string;
  signupId?: string;
  limit?: number;
}): Promise<ExperienceRow[]> {
  const sql = db();
  const rows = await sql`
    select
      e.id, e.company, e.role, e.result, e.summary, e.created_at,
      e.signup_id, s.name, s.seed, s.gender,
      coalesce(
        (
          select json_agg(
            json_build_object(
              'round_number', r.round_number,
              'round_type', r.round_type,
              'description', r.description,
              'outcome', r.outcome
            ) order by r.round_number
          )
          from experience_rounds r
          where r.experience_id = e.id
        ),
        '[]'
      ) as rounds
    from experiences e
    join signups s on s.id = e.signup_id
    where e.hidden = false
      and (${company ?? null}::text is null or lower(e.company) like lower(${company ?? ""}) || '%')
      and (${signupId ?? null}::bigint is null or e.signup_id = ${signupId ?? null}::bigint)
    order by e.created_at desc
    limit ${limit}
  `;
  return rows as ExperienceRow[];
}
