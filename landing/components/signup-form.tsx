"use client";

import { useMemo, useState } from "react";

import { AvatarImage } from "./avatar";
import { usePeople } from "./people-provider";
import { COUNTRIES } from "@/lib/countries.ts";
import { GENDERS, type Gender } from "@/lib/gender-options.ts";
import { copy } from "@/lib/copy.ts";
import type { SignupRow } from "@/lib/db";

function newSeed(): string {
  return crypto.randomUUID().slice(0, 8);
}

/**
 * Name, country, gender, face.
 *
 * The avatar appears the moment the form loads rather than after joining, so
 * the reroll button is the thing people play with while deciding. Whichever
 * face is on screen at the moment they join is the one that gets saved.
 *
 * The first seed arrives as a prop from the server rather than being drawn on
 * mount, so the markup React sends and the markup it hydrates are the same.
 */
export function SignupForm({ initialSeed }: { initialSeed: string }) {
  const { joined, add } = usePeople();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("IN");
  const [gender, setGender] = useState<Gender>("neutral");
  const [seed, setSeed] = useState(initialSeed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  const clientId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const existing = localStorage.getItem("unemployed:client");
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem("unemployed:client", fresh);
    return fresh;
  }, []);

  async function join() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, country, gender, seed, clientId }),
      });
      const data = await res.json();

      if (!res.ok) {
        const key = data.error as keyof typeof copy.join.errors;
        setError({ message: copy.join.errors[key] ?? copy.join.errors.generic, field: data.field });
        return;
      }

      // The provider writes localStorage and tells the hero, the counter and
      // the install steps at once.
      add(data as SignupRow);
    } catch {
      setError({ message: copy.join.errors.generic });
    } finally {
      setBusy(false);
    }
  }

  if (joined) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">{copy.join.joined}</p>
        <p className="text-muted-foreground mt-1 text-sm">{copy.join.joinedBody}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <AvatarImage seed={seed} gender={gender} size={96} priority />
          <button
            type="button"
            onClick={() => setSeed(newSeed())}
            className="rounded-md border px-2 py-1 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {copy.join.reroll}
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              {copy.join.nameLabel}
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.join.namePlaceholder}
              maxLength={40}
              className="h-9 w-full rounded-lg border bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="country" className="text-sm font-medium">
              {copy.join.countryLabel}
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-9 w-full max-w-xs rounded-lg border bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Its own row: three labels next to a country select wrapped onto two
              lines and pulled the whole group out of alignment. */}
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">{copy.join.genderLabel}</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {GENDERS.map((g) => (
                <label
                  key={g}
                  className="flex cursor-pointer items-center gap-1.5 text-sm whitespace-nowrap"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    className="size-3.5 accent-foreground"
                  />
                  {copy.join.genderOptions[g]}
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="rounded-md border px-3 py-2 text-sm font-medium" role="alert">
              {error.message}
            </p>
          )}

          <button
            type="button"
            onClick={join}
            disabled={busy || name.trim().length === 0}
            className="rounded-lg border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {busy ? copy.join.submitting : copy.join.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
