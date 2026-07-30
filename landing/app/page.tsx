import { Suspense, cache } from "react";

import { CopyButton } from "@/components/copy-button";
import { HeroBoard } from "@/components/hero-board";
import { Logo } from "@/components/logo";
import { PageNav } from "@/components/page-nav";
import { Reveal } from "@/components/reveal";
import { Wall } from "@/components/wall";
import { recentSignups, type SignupRow } from "@/lib/db";
import { copy } from "@/lib/copy";

// The wall is read per request, so nothing is prerendered and the build never
// needs a database.
export const dynamic = "force-dynamic";

/**
 * One page, one scroll, black and white. The only colour anywhere on it is
 * inside the avatar SVGs.
 *
 * The hero is the exception to the "nothing above the fold touches the
 * database" rule, because the crowd behind the headline is the argument. It is
 * still wrapped in Suspense, so a cold Neon delays the faces and nothing else:
 * the wordmark, the pitch and the buttons are on screen either way.
 */
export default function Home() {
  return (
    <>
      <PageNav />
      <main id="top">
        <Hero />

        <div className="mx-auto w-full max-w-2xl px-6 pb-24">
          <Reveal>
            <Section id="problem" heading={copy.problem.heading}>
              <ul className="space-y-4">
                {copy.problem.lines.map((line) => (
                  <li key={line} className="flex gap-4">
                    <span aria-hidden className="text-muted-foreground/50 font-mono text-xs">
                      /
                    </span>
                    <span className="text-muted-foreground">{line}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-serif text-xl leading-snug">{copy.problem.closer}</p>
            </Section>
          </Reveal>

          <Section id="what" heading={copy.what.heading}>
            <div className="divide-y rounded-xl border">
              {copy.what.items.map((item, i) => (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="p-6">
                    <h3 className="font-serif text-xl">{item.title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>

          <Reveal>
            <Section id="local" heading={copy.local.heading}>
              <p className="font-serif text-2xl leading-snug">{copy.local.body}</p>
              <p className="text-muted-foreground mt-6 border-l pl-5 text-sm">
                {copy.local.aside}
              </p>
            </Section>
          </Reveal>

          <Reveal>
            <Section id="install" heading={copy.install.heading}>
              <p className="text-muted-foreground text-sm">{copy.install.intro}</p>
              <ol className="mt-8 space-y-7">
                {copy.install.steps.map((step, i) => (
                  <li key={step.title} className="space-y-2.5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-muted-foreground font-mono text-xs tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-medium">{step.title}</h3>
                    </div>
                    <CopyButton command={step.command} />
                    <p className="text-muted-foreground pl-1 text-xs">{step.note}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-sm">
                {copy.install.outroBefore}{" "}
                <a href={copy.install.port} className="font-mono underline underline-offset-4">
                  {copy.install.portLabel}
                </a>{" "}
                {copy.install.outroAfter}
              </p>
            </Section>
          </Reveal>

          <Suspense fallback={<WallSkeleton />}>
            <WallSection />
          </Suspense>

          <footer className="text-muted-foreground mt-28 border-t pt-8 text-xs">
            <p>{copy.footer.built}</p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <span>{copy.footer.licence}</span>
              <span>{copy.footer.avatars}</span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

/**
 * Full height, the wordmark front and centre, the crowd behind it. The two
 * buttons are the only things asked of a first-time visitor.
 */
function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <Suspense fallback={null}>
        <HeroCrowd />
      </Suspense>

      <div className="relative z-10 flex flex-col items-center">
        <p className="text-muted-foreground mb-8 font-mono text-[11px] tracking-[0.2em] uppercase">
          {copy.hero.eyebrow}
        </p>

        <h1>
          <Logo size="hero" />
        </h1>

        <p className="mt-8 max-w-xl font-serif text-2xl leading-snug text-balance sm:text-3xl">
          {copy.hero.tagline}
        </p>
        <p className="text-muted-foreground mt-5 max-w-lg text-sm leading-relaxed text-balance">
          {copy.hero.sub}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#wall"
            className="border-foreground bg-foreground text-background rounded-lg border px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {copy.hero.primary}
          </a>
          <a
            href="#what"
            className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {copy.hero.secondary}
          </a>
        </div>

        <Suspense fallback={null}>
          <HeroCount />
        </Suspense>
      </div>

      <span
        aria-hidden
        className="scroll-hint text-muted-foreground absolute bottom-8 font-mono text-[10px] tracking-[0.2em] uppercase"
      >
        {copy.hero.scroll}
      </span>
    </section>
  );
}

async function HeroCrowd() {
  return <HeroBoard people={await people()} />;
}

async function HeroCount() {
  const everyone = await people();
  if (everyone.length === 0) return null;
  return (
    <p className="text-muted-foreground mt-7 font-mono text-[11px] tracking-wider">
      {copy.hero.counting(everyone.length)}
    </p>
  );
}

/**
 * One read per request, shared by the hero and the wall.
 *
 * An unreachable database returns an empty list rather than throwing: the page
 * is still worth reading without the faces on it.
 */
const people = cache(async (): Promise<SignupRow[]> => {
  try {
    return await recentSignups(200);
  } catch (error) {
    console.error("wall unavailable", error);
    return [];
  }
});

async function WallSection() {
  return (
    <Wall initial={await people()} initialSeed={crypto.randomUUID().slice(0, 8)} />
  );
}

function WallSkeleton() {
  return (
    <section className="mt-28">
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
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 pt-28">
      <h2 className="text-muted-foreground mb-6 font-mono text-[11px] tracking-[0.2em] uppercase">
        {heading}
      </h2>
      {children}
    </section>
  );
}
