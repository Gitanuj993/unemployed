"use client";

import { useState } from "react";

import { AvatarImage } from "./avatar";
import { PersonExperiences } from "./person-experiences";
import { SignupForm } from "./signup-form";
import { useEveryone } from "./people-provider";
import { countryName } from "@/lib/countries";
import { copy } from "@/lib/copy";
import type { SignupRow } from "@/lib/db";

/**
 * The form and the wall are one component because joining has to show up
 * immediately. The server sends the rows it had; a new one is prepended in
 * place rather than waiting on a refetch that the edge might answer from a
 * thirty second old cache.
 *
 * Each face is a button rather than a link, because selecting someone opens
 * their interview experiences here instead of navigating away.
 */
export function Wall({
  fromServer,
  initialSeed,
}: {
  fromServer: SignupRow[];
  initialSeed: string;
}) {
  const people = useEveryone(fromServer);
  const [selected, setSelected] = useState<SignupRow | null>(null);

  return (
    <>
      <section id="wall" className="scroll-mt-20 pt-28 px-6 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-muted-foreground font-mono text-[11px] tracking-[0.2em] uppercase">
            {copy.join.label}
          </p>
          <h1 className="mt-5 font-serif text-3xl leading-tight sm:text-4xl">
            {copy.join.heading}
          </h1>
          <p className="text-muted-foreground mt-4 mb-6 text-base leading-relaxed">
            {copy.join.body}
          </p>
          <SignupForm initialSeed={initialSeed} />
          <p className="text-muted-foreground mt-3 text-xs">{copy.join.why}</p>
        </div>
      </section>

      <section className="pt-24 pb-32 px-6 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-muted-foreground mb-6 font-mono text-[11px] tracking-[0.2em] uppercase">
            {copy.wall.heading}
          </h2>

          {people.length === 0 ? (
            <p className="text-muted-foreground text-sm">{copy.wall.empty}</p>
          ) : (
            <>
              <p className="text-muted-foreground mb-6 text-sm">
                {copy.wall.caption(people.length)}{" "}
                <span className="text-muted-foreground/70">{copy.wall.tapHint}</span>
              </p>
              <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5">
                {people.map((person) => (
                  <li key={person.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(person)}
                      aria-label={copy.wall.personAria(person.name)}
                      className="hover:bg-muted/60 flex w-full flex-col items-center rounded-lg p-2 text-center transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <AvatarImage seed={person.seed} gender={person.gender} />
                      <span className="mt-2 w-full truncate text-xs font-medium">
                        {person.name}
                      </span>
                      <span className="text-muted-foreground w-full truncate text-[11px]">
                        {countryName(person.country)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <PersonExperiences person={selected} onClose={() => setSelected(null)} />
    </>
  );
}
