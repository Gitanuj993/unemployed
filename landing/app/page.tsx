import { Suspense } from "react";

import { Logo } from "@/components/logo";
import { CopyButton } from "@/components/copy-button";
import { Wall } from "@/components/wall";
import { recentSignups } from "@/lib/db";
import { copy } from "@/lib/copy";

// The wall is read per request, so nothing here is prerendered at build time.
// That also means the build never needs a database.
export const dynamic = "force-dynamic";

/**
 * One page, one scroll, black and white. The only colour anywhere on it is
 * inside the avatar SVGs further down.
 *
 * Nothing above the fold touches the database. Neon's free tier sleeps after a
 * few idle minutes and takes a second or two to wake, so the pitch and the
 * install steps stream immediately and only the wall waits.
 */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-20 sm:py-28">
      {/* 1. Hero */}
      <header>
        <h1>
          <Logo size="hero" />
        </h1>
        <p className="mt-6 text-lg font-medium">{copy.hero.tagline}</p>
        <p className="text-muted-foreground mt-3">{copy.hero.sub}</p>
      </header>

      {/* 2. The week you are having */}
      <Section heading={copy.problem.heading}>
        <ul className="space-y-3">
          {copy.problem.lines.map((line) => (
            <li key={line} className="text-muted-foreground flex gap-3">
              <span aria-hidden className="text-foreground/40 select-none">
                /
              </span>
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-5">{copy.problem.closer}</p>
      </Section>

      {/* 3. What it does */}
      <Section heading={copy.what.heading}>
        <div className="divide-y rounded-lg border">
          {copy.what.items.map((item) => (
            <div key={item.title} className="p-5">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Runs on your laptop. The reason to trust it, so it gets room. */}
      <Section heading={copy.local.heading}>
        <p className="text-muted-foreground">{copy.local.body}</p>
        <p className="mt-4 border-l-2 pl-4 text-sm">{copy.local.aside}</p>
      </Section>

      {/* 5. Get it running */}
      <Section heading={copy.install.heading}>
        <p className="text-muted-foreground text-sm">{copy.install.intro}</p>
        <ol className="mt-6 space-y-6">
          {copy.install.steps.map((step, i) => (
            <li key={step.title} className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {i + 1}
                </span>
                <h3 className="font-medium">{step.title}</h3>
              </div>
              <CopyButton command={step.command} />
              <p className="text-muted-foreground text-xs">{step.note}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm">
          {copy.install.outroBefore}{" "}
          <a href={copy.install.port} className="underline underline-offset-4">
            {copy.install.portLabel}
          </a>{" "}
          {copy.install.outroAfter}
        </p>
      </Section>

      <Suspense fallback={<WallSkeleton />}>
        <WallSection />
      </Suspense>

      <footer className="text-muted-foreground mt-24 border-t pt-8 text-xs">
        <p>{copy.footer.built}</p>
        <p className="mt-2 space-x-3">
          <span>{copy.footer.licence}</span>
          <span>{copy.footer.avatars}</span>
        </p>
      </footer>
    </main>
  );
}

/**
 * The only part of the page that needs Postgres. An unreachable database shows
 * an empty wall rather than an error page, because the rest of this page is
 * still worth reading.
 */
async function WallSection() {
  let people: Awaited<ReturnType<typeof recentSignups>> = [];
  try {
    people = await recentSignups(200);
  } catch (error) {
    console.error("wall unavailable", error);
  }
  // Drawn here so the server and the browser agree on the first face.
  return <Wall initial={people} initialSeed={crypto.randomUUID().slice(0, 8)} />;
}

function WallSkeleton() {
  return (
    <section className="mt-20">
      <div className="bg-muted h-3 w-24 animate-pulse rounded" />
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="bg-muted size-14 animate-pulse rounded-full" />
        ))}
      </div>
    </section>
  );
}

/** Every block below the hero has the same rhythm. */
function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-20">
      <h2 className="mb-5 font-mono text-xs tracking-widest uppercase">{heading}</h2>
      {children}
    </section>
  );
}
