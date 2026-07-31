import { db, recentSignups, type SignupRow } from "@/lib/db";
import { asGenderStrict, checkName, isValidCountry, isValidSeedInput } from "@/lib/validate";
import { CACHE, CORS, corsOptions } from "@/lib/cors";
import { ipHash, isUniqueViolation } from "@/lib/ip";

// Never prerender. The read is request-time by nature, and if `cacheComponents`
// is ever switched on, a board frozen at build time is a silent bug.
export const dynamic = "force-dynamic";

const MAX_PER_IP = 3;
const WINDOW_MINUTES = 10;

export async function OPTIONS() {
  // Next only auto-answers OPTIONS with an Allow header, which does not satisfy
  // a CORS preflight.
  return corsOptions();
}

export async function GET(request: Request) {
  const raw = Number(new URL(request.url).searchParams.get("limit"));
  const limit = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), 500) : 200;

  try {
    const signups = await recentSignups(limit);
    return Response.json(
      { count: signups.length, signups },
      { headers: { ...CORS, ...CACHE } },
    );
  } catch (error) {
    console.error("board read failed", error);
    return Response.json({ error: "board unavailable" }, { status: 503, headers: CORS });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("generic", 400);
  }
  if (typeof body !== "object" || body === null) return fail("generic", 400);

  const { name: rawName, country, gender, seed, clientId } = body as Record<string, unknown>;

  const { name, problem } = checkName(rawName);
  if (problem) return fail(problem, problem === "profane" ? 422 : 400, "name");

  if (!isValidCountry(country)) return fail("country", 400, "country");
  const chosenGender = asGenderStrict(gender);
  if (!chosenGender) return fail("generic", 400, "gender");
  if (!isValidSeedInput(seed)) return fail("generic", 400);

  const client = typeof clientId === "string" && clientId.length <= 64 ? clientId : null;

  try {
    const sql = db();
    // The rate limit lives inside the insert, so it costs no extra round trip
    // and it holds across serverless instances, where an in-memory counter
    // would count only the requests that happened to land on the same one.
    const rows = (await sql`
      with recent as (
        select count(*)::int as n from signups
        where ip_hash = ${ipHash(request)}
          and created_at > now() - make_interval(mins => ${WINDOW_MINUTES})
      ), inserted as (
        insert into signups (name, country, gender, seed, ip_hash, client_id)
        select ${name}, ${country.toUpperCase()}, ${chosenGender}, ${seed},
               ${ipHash(request)}, ${client}
        from recent where n < ${MAX_PER_IP}
        returning id, name, country, gender, seed, created_at
      )
      select * from inserted
    `) as SignupRow[];

    if (rows.length === 0) return fail("rateLimited", 429);
    return Response.json(rows[0], { status: 201, headers: CORS });
  } catch (error) {
    // Already on the wall from this browser. A double click should look like
    // success, not like a failure, so hand back the row that already exists.
    if (isUniqueViolation(error) && client) {
      const existing = await existingFor(client);
      if (existing) return Response.json(existing, { status: 200, headers: CORS });
    }
    console.error("signup failed", error);
    return fail("generic", 503);
  }
}

function fail(error: string, status: number, field?: string) {
  return Response.json({ error, field }, { status, headers: CORS });
}

async function existingFor(clientId: string): Promise<SignupRow | null> {
  try {
    const sql = db();
    const rows = (await sql`
      select id, name, country, gender, seed, created_at
      from signups where client_id = ${clientId} limit 1
    `) as SignupRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
