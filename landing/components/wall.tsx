"use client";

import { useState } from "react";

import { AvatarImage } from "./avatar";
import { SignupForm } from "./signup-form";
import { countryName } from "@/lib/countries.ts";
import { copy } from "@/lib/copy.ts";
import type { SignupRow } from "@/lib/db";

/**
 * The form and the wall are one component because joining has to show up
 * immediately. The server sends the rows it had; a new one is prepended in
 * place rather than waiting on a refetch that the edge might answer from a
 * thirty second old cache.
 */
export function Wall({
  initial,
  initialSeed,
}: {
  initial: SignupRow[];
  initialSeed: string;
}) {
  const [people, setPeople] = useState(initial);

  return (
    <>
      <section id="wall" className="scroll-mt-20 pt-28">
        <h2 className="text-muted-foreground mb-6 font-mono text-[11px] tracking-[0.2em] uppercase">
          {copy.join.heading}
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">{copy.join.body}</p>
        <SignupForm
          initialSeed={initialSeed}
          onJoined={(row) => setPeople((prev) => [row, ...prev])}
        />
        <p className="text-muted-foreground mt-3 text-xs">{copy.join.why}</p>
      </section>

      <section className="pt-28">
        <h2 className="text-muted-foreground mb-6 font-mono text-[11px] tracking-[0.2em] uppercase">
          {copy.wall.heading}
        </h2>

        {people.length === 0 ? (
          <p className="text-muted-foreground text-sm">{copy.wall.empty}</p>
        ) : (
          <>
            <p className="text-muted-foreground mb-6 text-sm">
              {copy.wall.caption(people.length)}
            </p>
            <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5">
              {people.map((person) => (
                <li key={person.id} className="flex flex-col items-center text-center">
                  <AvatarImage seed={person.seed} gender={person.gender} />
                  <span className="mt-2 w-full truncate text-xs font-medium">
                    {person.name}
                  </span>
                  <span className="text-muted-foreground w-full truncate text-[11px]">
                    {countryName(person.country)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
